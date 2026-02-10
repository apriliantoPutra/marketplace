const express= require('express')
const router= express.Router()
const {verifyToken, verifyRole}= require('../middlewares/auth')

const {createCategory, getAllCategories, deleteCategory}= require('../controllers/categoryController')

router.get('/', getAllCategories)

// admin
router.post('/', verifyToken, verifyRole('admin'), createCategory)
router.delete('/:id', verifyToken, verifyRole('admin'), deleteCategory)

module.exports= router