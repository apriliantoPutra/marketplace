const pool= require('../configs/db')
const bcrypt= require('bcrypt')
const urlUtils= require('../utils/urlUtils')

const getAllUsers= async(req, res)=> {
    try {
        const result= await pool.query(`
            SELECT u.id, u.username, u.email, u.role, 
            p.full_name, p.address, p.phone, p.avatar_url 
            FROM users u
            LEFT JOIN profils p ON u.id = p.user_id
            ORDER BY u.id ASC`)

            const response= result.rows.map(user=> {
                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profile: {
                        full_name: user.full_name,
                        address: user.address,
                        phone: user.phone,
                        avatar_url: user.avatar_url ? `${urlUtils.getBaseUrl()}${user.avatar_url}` : null
                    }
                }
            })

            res.status(200).json({
                message: 'Berhasil mengambil data semua user',
                count: result.rowCount,
                data: response
            })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengambil data user'})
    }
}
const getUserById= async(req, res)=> {
    try {
        const {id}= req.params
        const result= await pool.query(`
            SELECT u.id, u.username, u.email, u.role,
            p.full_name, p.address, p.phone, p.avatar_url
            FROM users u
            LEFT JOIN profils p ON u.id = p.user_id
            WHERE u.id= $1`, [id])
        
            if(result.rowCount === 0){
                return res.status(404).json({error: 'Data user tidak ditemukan'})
            }

            const response= {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                role: result.rows[0].role,
                profile: {
                    full_name: result.rows[0].full_name,
                    address: result.rows[0].address,
                    phone: result.rows[0].phone,
                   avatar_url: result.rows[0].avatar_url ? `${urlUtils.getBaseUrl()}${result.rows[0].avatar_url}` : null
                }
            }

            res.status(200).json({
                message: 'Berhasil mengambil data user',
                data: response
            })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengambil data user'})
    } 
}
const getUserByLogin= async(req, res)=> {
    try {
        const userId= req.user.id
        const result= await pool.query(`
            SELECT u.id, u.username, u.email, u.role,
            p.full_name, p.address, p.phone, p.avatar_url
            FROM users u
            LEFT JOIN profils p ON u.id = p.user_id
            WHERE u.id= $1`, [userId])
        
            if(result.rowCount === 0){
                return res.status(404).json({error: 'Data user tidak ditemukan'})
            }

            const response= {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                role: result.rows[0].role,
                profile: {
                    full_name: result.rows[0].full_name,
                    address: result.rows[0].address,
                    phone: result.rows[0].phone,
                    avatar_url: result.rows[0].avatar_url ? `${urlUtils.getBaseUrl()}${result.rows[0].avatar_url}` : null
                }
            }

            res.status(200).json({
                message: 'Berhasil mengambil data user',
                data: response
            })
        
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengambil data user'})
    } 
}

const createUser= async(req, res)=> {
    try {
        const {username, email, password, role}= req.body

        const hashedPassword= await bcrypt.hash(password, 10)
        await pool.query(`
            INSERT INTO users (username, email, password, role)
            VALUES ($1, $2, $3, $4)
        `, [username, email, hashedPassword, role])

        res.status(201).json({
            message: 'Berhasil menambah data user'
        })

    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat menambah data user'})
    }
}
const updateUser= async(req, res)=> {
    try {
        const {id}= req.params
        const {username, email, password, role}= req.body

        const existingUser= await pool.query(`
            SELECT id, username, email, role, password FROM users
            WHERE id= $1
        `, [id])

        if(existingUser.rowCount === 0){
            return res.status(404).json({error: 'Data user tidak ditemukan'})
        }
        let hashedPassword= existingUser.rows[0].password
        if(password){
            hashedPassword= await bcrypt.hash(password, 10)
        }

        await pool.query(`
            UPDATE users SET username= $1, email= $2, password= $3, role= $4, updated_at= NOW()
            WHERE id= $5 
            `, [username, email, hashedPassword, role, id])
        
        res.status(200).json({
            message: 'Berhasil mengedit data user'
        })
    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat mengedit data user'})
    }
}
const deleteUser= async(req, res)=> {
    try {
        const {id}= req.params
        const existingUser= await pool.query(`
            SELECT id, username, email, role FROM users
            WHERE id= $1
        `, [id])

        if(existingUser.rowCount === 0){
            return res.status(404).json({error: 'Data user tidak ditemukan'})
        }

        await pool.query(`
            DELETE FROM users WHERE id= $1`, [id])
        res.status(200).json({
            message: 'Berhasil menghapus data user'
        })

    } catch (error) {
        console.error('Terjadi error: ', error)
        res.status(500).json({error: 'Terjadi kesalahan saat menghapus data user'})
    }
}
module.exports= {
    getAllUsers,
    getUserById,
    getUserByLogin,
    createUser,
    updateUser,
    deleteUser
}