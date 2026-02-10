const express= require('express')
const router= express.Router()
const {verifyToken}= require('../middlewares/auth')
const {createCart, updateCart, deleteCart, deleteAllCarts, getAllCartsByLogin, checkoutCart}= require('../controllers/cartController')

router.use(verifyToken)

// cart crud
router.get('/', getAllCartsByLogin)
router.post('/', createCart)
router.put('/:cart_id', updateCart)
router.delete('/', deleteAllCarts)
router.delete('/:cart_id', deleteCart)

// checkout
router.post('/checkout', checkoutCart)

module.exports= router