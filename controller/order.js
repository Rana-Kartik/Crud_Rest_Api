const Order = require('../models/order')

exports.orders_get = ('/',(req,res,next) => {
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