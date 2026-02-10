const express= require('express')
const router= express.Router()
const upload= require('../configs/multer')
const {verifyToken}= require('../middlewares/auth')
const {createProfil, updateProfil}= require('../controllers/profilController')

router.post('/', verifyToken, upload.single('avatar'), createProfil)
router.put('/', verifyToken, upload.single('avatar'), updateProfil)

module.exports= router