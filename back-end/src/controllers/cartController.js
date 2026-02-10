const pool= require('../configs/db');
const urlUtils = require('../utils/urlUtils');

const createCart= async(req, res)=> {
    try {
        const userId= req.user.id
        const {product_id}= req.body;

        const existingCart= await pool.query(`
            SELECT * FROM carts
            WHERE user_id= $1 AND product_id= $2
        `, [userId, product_id]);
        
        if(existingCart.rowCount > 0){
            const cartItem= existingCart.rows[0]
            await pool.query(`
                UPDATE carts SET quantity= quantity + 1
                WHERE id= $1 
            `, [cartItem.id])
            
            return res.status(201).json({
                message: 'Berhasil menambahkan 1 cart lagi'
            })
        }

        await pool.query(`
            INSERT INTO carts (user_id, product_id)
            VALUES ($1, $2)
            `, [userId, product_id])
        
        res.status(201).json({
            message: 'Berhasil menambahkan cart'
        })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat menambah cart'})   
    }
}
const getAllCartsByLogin= async(req, res)=> {
    try {
        const userId= req.user.id

        const result= await pool.query(`
            SELECT c.id as cart_id, c.quantity,
            p.id as product_id, p.name as product_name, p.price, p.stock, p.slug, p.image_url,
            cat.name as category_name
            FROM carts c
            INNER JOIN products p ON c.product_id = p.id
            LEFT JOIN categories cat ON p.category_id = cat.id
            WHERE c.user_id= $1
            ORDER BY c.id ASC
        `, [userId])

        if(result.rowCount === 0){
            return res.status(200).json({
                message: 'Data cart kosong',
                data: []
            })
        }
        const carts= result.rows.map(item=> ({
            cart_id: item.cart_id,
            quantity: item.quantity,
            product: {
                id: item.product_id,
                name: item.product_name,
                price: item.price,
                stock: item.stock,
                image_url: item.image_url? `${urlUtils.getBaseUrl()}${item.image_url}` : null,
                slug: item.slug,
                category: item.category_name
            },
            subTotal: item.price * item.quantity
        }))

        const total= carts.reduce((sum, item)=> sum + item.subTotal, 0)
        const quantity= carts.reduce((sum, item)=> sum + item.quantity, 0)

        res.status(200).json({
            message: 'Berhasil mengambil data cart',
            count: result.rowCount,
            summary: {
                total_items: carts.length,
                total_quantity: quantity,
                total_amount: total
            },
            data: carts
        })

    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat mengambil data cart'})
    }
}
const deleteCart= async(req, res)=>{
    try {
        const userId= req.user.id
        const {cart_id}= req.params

        // validasi cart milik user
        const existingCart= await pool.query(`
            SELECT c.*, p.name as product_name 
            FROM carts c
            INNER JOIN products p ON c.product_id= p.id
            WHERE c.id= $1 AND c.user_id= $2
        `, [cart_id, userId]);

        if(existingCart.rowCount === 0){
            return res.status(404).json({error: 'Data cart tidak ditemukan atau bukan milik Anda'})
        }
        const deleteItem= existingCart.rows[0]

        await pool.query(`
            DELETE FROM carts
            WHERE id= $1
        `, [cart_id])

        res.status(200).json({
            message: 'Item berhasil dihapus dari cart',
            delete_item: {
                product_name: deleteItem.product_name,
                quantity: deleteItem.quantity
            }
        })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat menghapus data cart'})
    }
}
const deleteAllCarts= async(req, res)=>{
    try {
        const userId= req.user.id
        const existingCart= await pool.query(`
            SELECT c.*, p.name as product_name 
            FROM carts c
            INNER JOIN products p ON c.product_id= p.id
            WHERE user_id= $1
        `, [userId]);

        if(existingCart.rowCount === 0){
            return res.status(200).json({message: 'Data cart kosong'})
        }

        await pool.query(`
            DELETE FROM carts WHERE user_id= $1
        `, [userId])

        res.status(200).json({
            message: 'Semua item cart berhasil dihapus',
            deleted_count: existingCart.rowCount,
            deleted_items: existingCart.rows.map(item=> ({
                product_name: item.product_name,
                quantity: item.quantity
            }))
        })

    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat menghapus semua data cart'})
    }
}
const updateCart= async(req, res)=> {
    const userId= req.user.id
    const {cart_id}= req.params
    const {action}= req.body

    if(!action || !['increase', 'decrease'].includes(action) ){
        return res.status(400).json({error: 'Action harus "increase" atau "decrease" '})
    }

    const client= await pool.connect()
    try {
        await client.query('BEGIN')

        const result= await client.query(`
              SELECT c.*, p.name as product_name, p.stock, p.price
              FROM carts c
              INNER JOIN products p ON c.product_id= p.id
              WHERE c.id= $1 AND c.user_id= $2
              FOR UPDATE  
        `, [cart_id, userId])

        if(result.rowCount === 0){
            await client.query('ROLLBACK')
            return res.status(404).json({error: 'Item cart tidak ditemukan atau bukan milik anda'})
        }
        const cartItem= result.rows[0]

        let newQuantity
        let message
        if(action === 'increase'){
            newQuantity= cartItem.quantity + 1
            message= 'Quantity berhasil ditambah'
        } else {
            newQuantity= cartItem.quantity - 1
            message= 'Quantity berhasil dikurangi'
        }

        await client.query(`
            UPDATE carts
            SET quantity= $1
            WHERE id= $2    
        `, [newQuantity, cart_id])

        await client.query('COMMIT')
        res.status(200).json({
            message: message,
        })

    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat menambah atau mengurangi quantity'})
    } finally {
        client.release()
    }
}
const checkoutCart= async(req, res)=>{
    const client= await pool.connect()
    try {
        await client.query('BEGIN')
        const userId= req.user.id
        const {
            shipping_full_name, shipping_phone, shipping_address, notes= ''
        }= req.body

        const carts= await client.query(`
            SELECT c.id as cart_id, c.quantity, p.id as product_id, p.name, p.stock, p.price
            FROM carts c
            INNER JOIN products p ON c.product_id= p.id
            WHERE c.user_id= $1
            FOR UPDATE  
        `, [userId])

        if (carts.rowCount === 0){
            throw new Error('Cart kosong, tidak bisa checkout')
        }

        let totalAmount= 0
        const orderItems= []
        // validasi stock dan hitung total
        for (const item of carts.rows){
            if(item.quantity > item.stock){
                throw new Error(`Stock ${item.name} tidak cukup. Tersedia: ${item.stock}`)
            }

            const subtotal= item.price * item.quantity
            totalAmount += subtotal

            orderItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                subtotal: subtotal
            })
        }

        // buat order
        const orderResult= await client.query(`
            INSERT INTO orders (user_id, total_amount, shipping_full_name, shipping_phone, shipping_address, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, shipping_full_name
        `, [userId, totalAmount, shipping_full_name, shipping_phone, shipping_address, notes])
        const order= orderResult.rows[0]

        // buat order_items dan update stock
        for (const item of orderItems){
            await client.query(`
                INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
                VALUES ($1, $2, $3, $4, $5)    
            `, [order.id, item.product_id, item.quantity, item.price, item.subtotal])

            await client.query(`
                UPDATE products SET stock= stock - $1
                WHERE id= $2     
            `, [item.quantity, item.product_id])
        }

        // hapus cart setelah checkout
        await client.query(`
            DELETE FROM carts WHERE user_id= $1    
        `, [userId])
        
        await client.query('COMMIT')
        res.status(201).json({
            message: 'CheckOut Berhasil',
            data: {
                id: order.id,
                total_amount: totalAmount,
                items_count: orderItems.length,
                shipping_info: {
                    full_name: shipping_full_name,
                    phone: shipping_phone,
                    address: shipping_address
                }
            }
        })
        
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi error saat CheckOut' })
    } finally {
        client.release()
    }
}

module.exports= {
    createCart,
    getAllCartsByLogin,
    deleteCart,
    deleteAllCarts,
    updateCart,
    checkoutCart
}