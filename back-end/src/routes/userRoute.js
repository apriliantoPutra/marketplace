const express= require('express')
const router= express.Router()
const {verifyToken, verifyRole}= require('../middlewares/auth')

const {createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserByLogin}= require('../controllers/userController')

// admin & user
router.get('/detail', verifyToken, getUserByLogin)

// admin
router.post('/', verifyToken, verifyRole('admin'), createUser)
router.get('/', verifyToken, verifyRole('admin'), getAllUsers)
router.get('/:id', verifyToken, verifyRole('admin'), getUserById)
router.put('/:id', verifyToken, verifyRole('admin'), updateUser)
router.delete('/:id', verifyToken, verifyRole('admin'), deleteUser)

module.exports= router