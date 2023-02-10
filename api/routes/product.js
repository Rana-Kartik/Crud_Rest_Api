const express = require('express')
const { default: mongoose } = require('mongoose')
//const mongoose = require('mongoose')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads/')
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    
    cb(null,false)
    cb(null, false)
}
const upload = multer({storage:storage, limits:{
    fieldSize: 1024 * 1024 * 5
}})

const router = express.Router()
const Product = require('../models/product')

router.get('/',(req,res,next) => {
     Product.find()
     .select('name price _id')
     .exec()
     .then(docs => {
        const response = {
            count : docs.length,
            products : docs.map(doc => {
                return {
                    name : doc.name,
                    price : doc.price,
                    productImage: doc.productImage,
                    _id : doc._id,
                    request : {
                        type: 'GET',
                        url:'/a' + doc._id
                    }
                }
            })
        }
       // console.log(docs)
        res.status(200).json(response)
     })
     .catch(err => {
        console.log(err)
        res.status(200).json({
            error:err
        })
     })
})

router.post('/addProduct', upload.single('productImage'),async(req,res,next) => {
   //console.log(req.file)
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name : req.body.name,
        price : req.body.price,
        productImage:req.file.path
    })
    await product.save()
    .then(result => {
        console.log(result)
        res.status(200).json({
            message : 'product added successfully',
            createProduct : {
                name : result.name,
                price : result.price,
                _id : result._id,
                request:{
                    type:'GET',
                    url:'/add' + result._id
                }
            }
         })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    })
    
})

router.get('/:productId', (req,res,next) => {
    const id = req.params.productId
    Product.findById(id)
    .select('name price _id')
    .exec()
    .then(doc => {
        console.log("from the database",doc)
        if(doc){
            res.status(200).json(doc)
        }else{
            res.status(404).json({
                message:'No valid id'
            })
        }
       
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({error:err})
    })
})

router.patch('/:productId', (req,res,next) => {
    const id = req.params.productId
    const updateOps = {}
    for(const ops of req.body){
         updateOps[ops.propName] = ops.value
    }
    Product.update({ _id : id}, {$set:updateOps})
    .exec()
    .then(result => {
        console.log("Data updated")
        res.status(200).json(result)
    })
    .catch(err => {
     console.log(err)
     res.status(500).json({
         error: err
     })
    })
})

router.delete('/:productId', (req,res,next) => {
    const id = req.params.productId
   Product.remove({_id : id})
   .exec()
   .then(result => {
       //console.log("Data deleted")
       res.status(200).json(({
        message: 'Product deeleted',
        request : {
            type: 'POST',
            url:'http://localhost:3000/products',
            body: {name: 'String', price:'Number'}
        }
       }))
   })
   .catch(err => {
    console.log(err)
    res.status(500).json({
        error: err
    })
   })
})

module.exports = router