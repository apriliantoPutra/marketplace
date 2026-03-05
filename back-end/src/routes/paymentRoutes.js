const express= require('express')
const router= express.Router()

const {createPayment, paymentWebhook, checkPaymentStatus}= require('../controllers/paymentController')
const { verifyToken, verifyRole } = require('../middlewares/auth')

router.post('/webhook', express.json(), paymentWebhook)

// pakai auth
router.post('/create/:order_id', verifyToken, verifyRole('user'), createPayment)
router.get('/status/:midtrans_order_id', verifyToken, verifyRole('user'), checkPaymentStatus)

module.exports= router