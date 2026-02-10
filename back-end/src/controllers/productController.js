const pool= require('../configs/db')
const generateSlug= require('../utils/slugGenerator')
const path= require('path')
const fs= require('fs')
const urlUtils= require('../utils/urlUtils')

const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.name as product_name, p.description, p.image_url, p.price, p.stock, p.slug,
            c.id as category_id, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id`)
        const response = result.rows.map(product => {
            return {
                id: product.id,
                name: product.product_name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                slug: product.slug,
                image_url: product.image_url ? `${urlUtils.getBaseUrl()}${product.image_url}` : null,
                category: {
                    id: product.category_id,
                    name: product.category_name
                }
            }
        })
        res.status(200).json({
            message: 'Berhasil mengambil data semua product',
            count: result.rowCount,
            data: response
        })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data product' })
    }
}

const getProductBySlug= async(req, res)=>{
    try {
        const {slug}= req.params
        const result= await pool.query(`
            SELECT p.id, p.name as product_name, p.description, p.image_url, p.price, p.stock, p.slug,
            c.id as category_id, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id= c.id
            WHERE p.slug= $1
        `, [slug])

        const response= {
            id: result.rows[0].id,
            name: result.rows[0].product_name,
            description: result.rows[0].description,
            price: result.rows[0].price,
            stock: result.rows[0].stock,
            slug: result.rows[0].slug,
            image_url: result.rows[0].image_url ? `${urlUtils.getBaseUrl()}${result.rows[0].image_url}` : null,
            category: {
                id: result.rows[0].category_id,
                name: result.rows[0].category_name,
            }
        }

        res.status(200).json({
            message: 'Berhasil mengambil data product berdasarkan slug',
            data: response
        })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengambil data product'})   
    }
}
const createProduct= async(req, res)=>{
    try {
        const {name, description, price, stock, category_id}= req.body
        const slug= generateSlug()

        // image product
        let image_url= null
        if(req.file){
            image_url= `/public/img/product/${req.file.filename}`
        }

        const result= await pool.query(`
            INSERT INTO products (category_id, name, description, price, stock, image_url, slug)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
            `, [category_id, name, description, price, stock, image_url, slug]
        )

        res.status(201).json({
                message: 'Berhasil membuat data product',
            })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat membuat product'})   
    }

}
const updateProduct= async(req, res)=>{
    try {
        const {id}= req.params
        const {name, description, price, stock, category_id}= req.body

        const existingProduct= await pool.query(`
            SELECT * FROM products
            WHERE id= $1`, [id])
        if(!existingProduct.rowCount === 0){
            return res.status(404).json({error: 'Data product tidak ditemukan'})
        }

        let image_url= existingProduct.rows[0].image_url
        if(req.file){
            if(image_url){
                const oldPath= path.join(process.cwd(), image_url)
                if(fs.existsSync(oldPath)){
                    fs.unlinkSync(oldPath)
                }
            }
            image_url= `/public/img/product/${req.file.filename}`
        }

        const result= await pool.query(`
            UPDATE products SET category_id= $1, name= $2, description= $3, price= $4, stock= $5, image_url= $6
            WHERE id= $7 RETURNING *
        `, [category_id, name, description, price, stock, image_url, id])

        res.status(200).json({
            message: 'Berhasil mengedit data product',
            
        })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengedit product'})   
    }

}
const deleteProduct= async(req, res)=>{
    try {
        const {id}= req.params
        const existingProduct= await pool.query(`
            SELECT * FROM products
            WHERE id= $1`, [id])
        if(!existingProduct.rowCount === 0){
            return res.status(404).json({error: 'Data product tidak ditemukan'})
        }

        const image_url= existingProduct.rows[0].image_url
        if(image_url){
            const oldPath= path.join(process.cwd(), image_url)
            if(fs.existsSync(oldPath)){
                fs.unlinkSync(oldPath)
            }
        }
        

        await pool.query(`
            DELETE FROM products
            WHERE id= $1`, [id])

        res.status(200).json({
            message: 'Berhasil menghapus data product',
        })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat menghapus product'})   
    }
}


module.exports= {
    getAllProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
}