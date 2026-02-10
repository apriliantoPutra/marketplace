const pool= require('../configs/db')
const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
require('dotenv').config()

const register= async(req, res)=> {
    try {
        const {username, email, password}= req.body
        
        // cek apakah username atau email sudah terdaftar
        const existingUser= await pool.query(`
            SELECT * FROM users WHERE username= $1 OR email= $2`, [username, email])
        if(existingUser.rowCount > 0){
            return res.status(400).json({error: 'Username atau email sudah terdaftar'})
        }

        const hashedPassword= await bcrypt.hash(password, 10)
        const result= await pool.query(`
            INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3) RETURNING id, username, email, role`, 
        [username, email, hashedPassword])
        const user= result.rows[0]

        // buat token JWT
        const token= jwt.sign(
            {id: user.id, username: user.username, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )

        res.status(201).json({
            message: 'Berhasil Register',
            tokenJWT: token,
            data: user
        })    
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat register'})
    }
}
const login= async(req, res)=> {
    try {
        const {username, password}= req.body
        // cek username
        const existingUsername= await pool.query(`
            SELECT * FROM users WHERE username= $1`, [username])
        if(existingUsername.rowCount === 0){
            return res.status(400).json({error: 'Username tidak ditemukan'})
        }
        const user= existingUsername.rows[0]
        
        // cek password
        const valid= await bcrypt.compare(password, user.password)
        if(!valid){
            return res.status(400).json({error: 'Password salah'})
        }

        // buat token
        const token= jwt.sign(
            {id: user.id, username: user.username, email: user.email, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        )

        res.status(200).json({
            message: 'Berhasil Login',
            tokenJWT: token,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat login'})
    }
}

module.exports= {
    register,
    login
}