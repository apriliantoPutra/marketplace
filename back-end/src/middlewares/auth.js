const jwt= require('jsonwebtoken')
const dotenv= require('dotenv')

const verifyToken= (req, res, next)=> {
    const authHeader= req.headers['authorization']
    const token= authHeader && authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({error: 'Akses ditolak. Tidak terdapat token'})
    }
    try {
        const decoded= jwt.verify(token, process.env.JWT_SECRET)
        req.user= decoded
        next()
    } catch (error) {
        res.status(403).json({error: 'Token tidak valid'})
    }
}
const verifyRole= (...roles)=>{
    return (req, res, next)=> {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({error: 'Akses ditolak: role tidak sesuai'})
        }
        next()
    }
}
module.exports= {
    verifyToken,
    verifyRole
}