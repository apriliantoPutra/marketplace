const pool = require("../configs/db")
const { snap, core } = require("../configs/payment")

const createPayment = async (req, res) => {
    const client = await pool.connect()
    try {
        const { order_id } = req.params
        const userId= req.user.id

        const orderResults = await client.query(`
            SELECT o.*, u.email, u.username
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1 AND o.user_id = $2`,
         [order_id, userId])

        if(orderResults.rows.length === 0){
            return res.status(404).json({ error: 'Order tidak ditemukan' });
        }

        const order = orderResults.rows[0]

        if (order.status === 'finished') {
            return res.status(400).json({ error: 'Order sudah selesai' });
        }
        if (order.status === 'cancelled') {
            return res.status(400).json({ error: 'Order sudah dibatalkan' });
        }

         // cek apakah order sudah dibayar
        if(order.payment_status === 'paid') {
            return res.status(400).json({ error: 'Order sudah dibayar' });
        }

        const midtransOrderId = `ORDER-${order.id}-${Date.now()}`

         // parameter untuk midtrans
        const parameters = {
            transaction_details: {
                order_id: midtransOrderId,
                gross_amount: order.total_amount
            }, 
            customer_details: {
                first_name: order.shipping_full_name,
                email: order.email,
                phone: order.shipping_phone
            },
            callbacks: {
                finish: `${process.env.FRONTEND_URL}/orders/${order.id}/payment-finish`,
                error: `${process.env.FRONTEND_URL}/orders/${order.id}/payment-error`,
                pending: `${process.env.FRONTEND_URL}/orders/${order.id}/payment-pending`
            },
            expiry: {
                duration: 1,
                unit: 'hour'
            }
        }
         // buat transaksi ke midrants
        const transaction = await snap.createTransaction(parameters)

         // update order dengan payment url dan status processing
        await client.query(`
            UPDATE orders
            SET payment_token = $1, 
            payment_url = $2, 
            payment_expiry = NOW() + INTERVAL '1 hours',
            midtrans_order_id = $3,
            payment_details = $4::jsonb,
            status = 'processing',
            updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            `, [
                transaction.token, transaction.redirect_url, midtransOrderId, JSON.stringify(transaction), order.id
            ])

        await client.query('COMMIT')
        res. json({
            message: 'Pembayaran berhasil dibuat',
            data: {
                order_id: order.id,
                payment_token: transaction.token,
                payment_url: transaction.redirect_url,
                midtrans_order_id: midtransOrderId,
                expiry_time: new Date(Date.now() + 1 * 60 * 60 * 1000) // jam sekarang + 1 jam
            }
        })

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Terjadi error: ', error)
        res.status(500).json({ error: 'Gagal membuat pembayaran' })
    } finally {
        client.release()
    }
}

const paymentWebhook = async (req, res) => {
  const client = await pool.connect()
  try {

    const notification = req.body
    const midtransOrderId = notification.order_id
    const transactionStatus = notification.transaction_status
    const paymentType = notification.payment_type

    await client.query('BEGIN')

    let paymentStatus = 'pending'
    let orderStatus = 'pending_payment'

    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      paymentStatus = 'paid'
      orderStatus = 'processing'
    } else if (transactionStatus === 'expire') {
      paymentStatus = 'expired'
      orderStatus = 'cancelled'
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny') {
      paymentStatus = 'failed'
      orderStatus = 'cancelled'
    }

    await client.query(`
      UPDATE orders
      SET payment_status = $1,
          status = $2,
          payment_method = $3,
          payment_details = payment_details || $4::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE midtrans_order_id = $5
    `, [paymentStatus, orderStatus, paymentType, JSON.stringify(notification), midtransOrderId])

    await client.query('COMMIT')
    res.status(200).json({ message: 'Berhasil memperbarui status pembayaran' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error("Webhook error:", err)
    res.status(500).json({ error: 'Webhook error' })
  } finally {
    client.release()
  }
}

const checkPaymentStatus = async (req, res) => {
    try {
        const { midtrans_order_id }= req.params
        const userId= req.user.id

        const result = await pool.query(`
            SELECT id, total_amount, status, payment_method,
            payment_status, payment_expiry
            FROM orders
            WHERE midtrans_order_id = $1 AND user_id = $2`
        , [midtrans_order_id, userId])

        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'Order tidak ditemukan' })
        }

        const order = result.rows[0]

        // hitung sisa waktu pembayaran
        let remainingTime = null
        if (order.payment_expiry && order.payment_status === 'pending') {
            remainingTime = new Date(order.payment_expiry) - new Date()
        }
        res.json({
            message: 'Status pembayaran berhasil diambil',
            data: {
                ...order,
                remaining_time: remainingTime > 0 ? remainingTime : 0
            }
        })
        
    } catch (error) {
        console.error('Error checking payment:', error);
        res.status(500).json({ error: 'Gagal cek status pembayaran' });
    }
}

module.exports = {
    createPayment,
    paymentWebhook,
    checkPaymentStatus
}