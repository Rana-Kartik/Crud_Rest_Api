const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Order = require('../models/order')
const product = require('../models/product')

//const orderController = require('../')

router.get('/',(req,res,next) => {
     Order.find()
     .select('product quntity _id')
     .populate('product','name')
     .exec()
     .then(docs => {
        res.status(200).json({
            count : docs.length,
            products : docs.map(doc => {
                return {
                    _id : doc._id,
                    product : doc.product,
                    quntity : doc.quntity,
                    request : {
                        type: 'GET',
                        url:'http://localhost:3000/orders' + doc._id
                    }
                }
            })
        })
     })
     .catch(err => {
        res.status(500).json({
            error: err
        })
     })
})

router.get('/:orderId', (req,res,next) => {
    const id = req.params.orderId
    Order.findById(id)
    .select('product quntity _id')
    .populate('product')
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

router.patch('/:orderID', (req,res,next) => {
    const id = req.params.orderID
    const updateOps = {}
    for(const ops of req.body){
         updateOps[ops.propName] = ops.value
    }
    Order.update({ _id : id}, {$set:updateOps})
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

router.post('/addOrder',async(req,res,next) => {
    product.findById(req.body.productId)
    .then(product => {

    })
    .catch(err => {
        res.status(500).json({
            message:'product is not found',
            error:err
        })
    })
    const order = new Order(
        {
            _id: mongoose.Types.ObjectId(),
            quntity : req.body.quntity,
            product : req.body.productId
        }
    ) 
  return order
    .save()
    .then(result => {
        console.log(result)
        res.status(201).json(result)
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            error: err
        })
    })
    
})

router.delete('/:orderID', (req,res,next) => {
    const id = req.params.orderID
   Order.remove({_id : id})
   .exec()
   .then(result => {
       //console.log("Data deleted")
       res.status(200).json(({
        message: 'order deeleted',
        request : {
            type: 'POST',
            url:'http://localhost:3000/orders',
            body: {quntity:'Number'}
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