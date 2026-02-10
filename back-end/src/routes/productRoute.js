const express= require('express')
const router= express.Router()
const upload= require('../configs/multer')
const {verifyToken, verifyRole}= require('../middlewares/auth')
const {getAllProducts, getProductBySlug, createProduct, updateProduct, deleteProduct}= require('../controllers/productController')

router.get('/', getAllProducts)
router.get('/:slug', getProductBySlug)

// admin
router.post('/', verifyToken, verifyRole('admin'), upload.single('product'), createProduct)
router.put('/:id', verifyToken, verifyRole('admin'), upload.single('product'), updateProduct)
router.delete('/:id', verifyToken, verifyRole('admin'),  deleteProduct)

module.exports= router