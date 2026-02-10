const pool= require('../configs/db')
const path= require('path')
const fs= require('fs')

const createProfil= async(req, res)=> {
    try {
        const userId= req.user.id
        const {full_name, address, phone}= req.body

        let avatar_url= null
        if(req.file){
            avatar_url= `/public/img/avatar/${req.file.filename}`
        }

        await pool.query(`
            INSERT INTO profils (user_id, full_name, address, phone, avatar_url)
            VALUES ($1, $2, $3, $4, $5) `, 
        [userId, full_name, address, phone, avatar_url])

        res.status(201).json({
            message: 'Berhasil membuat profil',
        })

        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat membuat profil'})
    }
}
const updateProfil= async(req, res)=> {
    try {
        const userId= req.user.id
        const {full_name, address, phone}= req.body

        const existingProfil= await pool.query(`
            SELECT * FROM profils WHERE user_id = $1
        `, [userId])

        if(existingProfil.rowCount === 0){
            return res.status(404).json({error: 'Data profil tidak ditemukan'})
        }

        let avatar_url= existingProfil.rows[0].avatar_url
        if(req.file){
            // hapus file lama jika ada
            if(avatar_url){
                const oldPath= path.join(process.cwd(), avatar_url)
                if(fs.existsSync(oldPath)){
                    fs.unlinkSync(oldPath)
                }
            }
            avatar_url= `/public/img/avatar/${req.file.filename}`
        }

        await pool.query(`
            UPDATE profils SET full_name= $1, address= $2, phone= $3, avatar_url= $4, updated_at= NOW()
            WHERE user_id= $5`, [full_name, address, phone, avatar_url, userId])

        res.status(200).json({
            message: 'Berhasil mengedit profil',
        })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengedit profil'})
    }
}

module.exports= {
    createProfil,
    updateProfil
}