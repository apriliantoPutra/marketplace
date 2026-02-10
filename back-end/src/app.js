const express= require('express')
const cors= require('cors')
const path= require('path')
const urlUtils= require('./utils/urlUtils')

const app= express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use('/public', express.static(path.join(process.cwd(), 'public')))

// routes
const userRoutes= require('./routes/userRoute')
const profilRoutes= require('./routes/profilRoute')
const authRoutes= require('./routes/authRoute')
const categoryRoutes= require('./routes/categoryRoute')
const productRoutes= require('./routes/productRoute')
const cartRoutes= require('./routes/cartRoute')
const orderRoutes= require('./routes/orderRoute')


app.get('/', (req, res)=> {
    res.send('Selamat datang di Market Project Back-End')
})

app.use('/api/user', userRoutes)
app.use('/api/profil', profilRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/category', categoryRoutes)
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/order', orderRoutes)


app.listen(urlUtils.PORT,()=> {
    console.log(`Server berjalan di link ${urlUtils.getBaseUrl()}`);
})
