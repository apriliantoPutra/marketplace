const multer= require('multer')
const fs= require('fs')
const path= require('path')

const baseDir= path.join(process.cwd(), 'public', 'img')

const storage= multer.diskStorage({
    destination: function(req, file, cb){
        // buat folder sesuai fieldname (avatar, product. dll)
        const folderName= file.fieldname
        const uploadPath= path.join(baseDir, folderName)
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, {recursive: true})
        }
        cb(null, uploadPath)
    },
    filename: function(req, file, cb){
        const uniqueSuffix= Date.now() + '-' + Math.round(Math.random() * 1e9)
        const ext= path.extname(file.originalname)
        const filename= file.fieldname + "-" + uniqueSuffix + ext
        cb(null, filename)
    }
})
const fileFilter= (req, file, cb)=> {
    if(file.mimetype.startsWith('image/'))
        cb(null, true)
    else
        cb(new Error('Hanya menerima file gambar (jpg, png, jpeg)'), false)
}
const upload= multer({
    storage,
    fileFilter,
    limits: {fileSize: 5 * 1024 * 1024} // 5mb
})
module.exports= upload