const pool= require('../configs/db')
const urlUtils= require('../utils/urlUtils')

const getAllOrdersByLogin= async(req, res)=> {
    try {
        const userId= req.user.id
        const result= await pool.query(`
            SELECT o.id, o.total_amount, o.shipping_full_name, o.shipping_phone, o.status, o.shipping_address, o.payment_status, o.created_at,
            COUNT(oi.id) as items_count, SUM(oi.quantity) as total_items
            FROM orders o
            LEFT JOIN order_items oi ON o.id= oi.order_id
            WHERE o.user_id= $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
    `, [userId])

    res.status(200).json({
        message: 'Berhasil mengambil semua data order',
        count: result.rowCount,
        data: result.rows
    })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat mengambil data order'})
    }
}


const getOrderById = async (req, res) => {
    try {
        const { order_id } = req.params
        
        // Validasi order_id
        const orderId = parseInt(order_id)
        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Order ID tidak valid' })
        }

        // Query order
        const orderResult = await pool.query(`
            SELECT o.*, u.username, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = $1
        `, [orderId])

        if (orderResult.rowCount === 0) {
            return res.status(404).json({ error: 'Tidak terdapat data order' })
        }
        
        const order = orderResult.rows[0]
        
        // Query order items
        const itemsResult = await pool.query(`
            SELECT oi.*, p.name as product_name, p.image_url, p.slug
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
            ORDER BY oi.created_at ASC
        `, [orderId])
        
        // Format response
        const response = {
            message: 'Berhasil mengambil data order',
            data: {
                order_info: {
                    id: order.id,
                    status: order.status,
                    total_amount: order.total_amount,
                    shipping_info: {
                        full_name: order.shipping_full_name,
                        phone: order.shipping_phone,
                        address: order.shipping_address
                    },
                    notes: order.notes,
                    customer: {
                        username: order.username,
                        email: order.email
                    },
                    created_at: order.created_at
                }, 
                items: itemsResult.rows.map(item => ({
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    subtotal: parseFloat(item.subtotal),
                    image_url: item.image_url ? `${urlUtils.getBaseUrl()}${item.image_url}` : null,
                    slug: item.slug
                })),
                summary: {
                    total_items: itemsResult.rowCount, // Perbaikan: rowCount bukan roeCount
                    total_quantity: itemsResult.rows.reduce((sum, item) => sum + parseInt(item.quantity), 0)
                }
            }
        }
        res.status(200).json(response)
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({ error: 'Terjadi error saat mengambil detail data order' })
    }
}

// admin
const getAllOrders= async(req, res)=> {
    try {
        const result= await pool.query(`
            SELECT o.id, o.total_amount, o.shipping_full_name, o.status, o.shipping_phone, o.shipping_address, o.payment_status, o.created_at,
            COUNT(oi.id) as items_count, SUM(oi.quantity) as total_items
            FROM orders o
            LEFT JOIN order_items oi ON o.id= oi.order_id
            GROUP BY o.id
            ORDER BY o.created_at DESC
    `)

    res.status(200).json({
        message: 'Berhasil mengambil semua data order',
        count: result.rowCount,
        data: result.rows
    })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat mengambil data order'})
    }
}

const getAllOrdersByUserId= async(req, res)=> {
    try {
        const {user_id}= req.params 

        const result= await pool.query(`
            SELECT o.id, o.total_amount, o.shipping_full_name, o.status, o.shipping_phone, o.shipping_address, o.created_at,
            COUNT(oi.id) as items_count, SUM(oi.quantity) as total_items
            FROM orders o
            LEFT JOIN order_items oi ON o.id= oi.order_id
            WHERE o.user_id= $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
    `, [user_id])

    res.status(200).json({
        message: 'Berhasil mengambil semua data order',
        count: result.rowCount,
        data: result.rows
    })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat mengambil data order'})
    }
}
const editStatusOrder= async(req, res)=> {
    try {
        const {order_id}= req.params
        const {status}= req.body
        const validStatuses= ['pending', 'processing', 'cancelled', 'finished']
        if(!status || !validStatuses.includes(status) ){
            return res.status(400).json({error: 'Status tidak valid'})
        }

        const existingOrder= await pool.query(`
            SELECT id, status FROM orders
            WHERE id= $1 
        `, [order_id])
        if(existingOrder.rowCount === 0){
            return res.status(404).json({error: 'Tidak terdapat data order'})
        }

        await pool.query(`
            UPDATE orders SET status= $1, updated_at= CURRENT_TIMESTAMP
            WHERE id= $2  
        `, [status, order_id])

        res.status(200).json({message: 'Status order berhasil diedit'})
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat mengedit status'})
    }
}

module.exports= {
    getAllOrdersByLogin, getAllOrdersByUserId, getOrderById, editStatusOrder, getAllOrders
}