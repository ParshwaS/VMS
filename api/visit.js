const mongoose = require('mongoose')
const Visit = mongoose.model('visit')
const jwt = require('jsonwebtoken')
const config = require('../config.json')

module.exports = function(app,io){
    app.get('/api/visits/list', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role == 'Admin'){
            Visit.find({}).then((docs)=>{
                res.json({status: true, docs})
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error", error: error})
            })
        }else if(decoded.role=='Visitor'){
            Visit.find({
                "visitor._id": decoded._id
            }).then((docs)=>{
                res.json({status: true, docs})
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error", error: error})
            })
        }
    })

    app.post('/api/visits/get', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role == 'Admin'){
            Visit.findOne({
                _id: req.body._id
            }).then((doc)=>{
                res.json({status: true, doc})
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error", error: error})
            })
        }else if(decoded.role == 'Visitor'){
            Visit.findOne({
                _id: req.body._id,
                "visitor._id": decoded._id
            }).then((doc)=>{
                res.json({status: true, doc})
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error", error: error})
            })
        }
    })

    app.post('/api/visits/delete', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role == 'Admin'){
            Visit.deleteOne({
                _id: req.body._id
            }).then((doc)=>{
                res.json({status: true, message: "Deleted Successfully"})
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error", error: error})
            })
        }
    })
}