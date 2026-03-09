const express= require('express')
const router= express.Router()
const {verifyToken, verifyRole}= require('../middlewares/auth')
const {getAllOrdersByLogin, getOrderById, editStatusOrder, getAllOrders, getAllOrdersByUserId}= require('../controllers/orderController')

router.use(verifyToken)

// admin
router.get('/', verifyRole('admin'), getAllOrders)
router.get('/user/:user_id', verifyRole('admin'), getAllOrdersByUserId)
router.put('/:order_id/status', verifyRole('admin'), editStatusOrder)

// user
router.get('/my-orders', getAllOrdersByLogin)
router.get('/:order_id', getOrderById)


module.exports= router