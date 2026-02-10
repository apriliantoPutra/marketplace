const {Pool}= require('pg')
const dotenv= require('dotenv')
dotenv.config()

const pool= new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
pool.connect()
    .then(()=> console.log('Berhasil terhubung ke database'))
    .catch((err)=> console.error('Gagal terhubung ke database', err.stack))

module.exports= pool