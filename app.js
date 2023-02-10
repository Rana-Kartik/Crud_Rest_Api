const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose') 

const productRoutes = require('./api/routes/product')
const orderRoutes = require('./api/routes/order')
const userRoutes = require('./api/routes/user')


mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://kartik:kartik@ranaka.y572pfo.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
    console.log('Database connection successfully')
}) 
.catch(()=>{
    console.log('something went wrong')
})

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

app.use((req,res,next) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','Origin , X-Reuested-With, Content-TypeError, Authorization')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})


app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/user', userRoutes)


app.use((req,res,next) => {
     const error = new Error('not found')
     error.status = 404
     next(error)

})

app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        error : {
            message : error.message
        }
    })
})

module.exports = app