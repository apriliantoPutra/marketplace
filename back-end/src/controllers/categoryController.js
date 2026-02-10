const pool= require('../configs/db')
const generateSlug= require('../utils/slugGenerator')

const createCategory= async(req, res)=> {
    try {
        const {name, description}= req.body
        const slug= generateSlug()

        const result= await pool.query(`
            INSERT INTO categories (name, description, slug)
            VALUES ($1, $2, $3) RETURNING *`, [name, description, slug])

        res.status(201).json({
            message: 'Berhasil menambahkan kategori',
            data: result.rows[0]
        })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat membuat kategori'})
    }
}
const getAllCategories= async(req, res)=>{
    try {
        const result= await pool.query(`
            SELECT * FROM categories
            ORDER BY id ASC
        `)
        res.status(200).json({
            message: 'Berhasil mengambil data kategori',
            count: result.rowCount,
            data: result.rows
        })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengambil data kategori'})
    }
}
const getCategoryBySlug= async(req, res)=>{
    try {
        const {slug}= req.params
        const result= await pool.query(`
            SELECT * FROM categories
            WHERE slug= $1
        `, [slug])
        if(result.rowCount === 0){
            return res.status(404).json({error: 'Kategori tidak ditemukan'})
        }

        res.status(200).json({
            message: 'Berhasil mengambil data kategori',
            data: result.rows[0]
        })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengambil data kategori'})
    }
}
const deleteCategory= async(req, res)=> {
    try {
        const {id}= req.params
        const existingCategory= await pool.query(`
            SELECT * FROM categories
            WHERE id= $1
            `, [id])
        if(existingCategory.rowCount === 0){
            return res.status(404).json({error: 'Kategori tidak ditemukan'})
        }

        await pool.query(`
            DELETE FROM categories
            WHERE id= $1
            `, [id])
        res.status(200).json({
            message: 'Berhasil menghapus data kategori'
        })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat hapus data kategori'})
    }
}

module.exports= {
    createCategory,
    getAllCategories,
    getCategoryBySlug,
    deleteCategory
}
