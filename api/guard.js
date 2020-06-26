const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Guard = mongoose.model('guard')
const config = require('../config.json')

module.exports = function(app,io){
    
    app.get('/api/guards/list',(req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'],config.secret)
        if(decoded.role == 'Admin'){
            Guard.find({}).then((docs)=>{
                res.json({status: true, docs})
            }).catch((error)=>{
                res.json({error})
            })
        }else{
            res.json({status: false, message: "Unauthorized Access"})
        }
    })

    app.post('/api/guards/add', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'],config.secret)
        if(decoded.role == 'Admin'){
            Guard.find({
                userId: req.body.userId
            }).then((docs)=>{
                if(docs && docs.length>0){
                    res.json({stauts: false, message: "UserId is repeating"})
                }else{
                    var guard = new Guard(req.body)
                    guard.save().then((doc)=>{
                        res.json({status: true, message: "Guard Added"})
                    }).catch((error)=>{
                        res.json({status: false, message: "Internal Error", error: error})
                    })
                }
            }).catch((error)=>{
                res.json({status: false, error})
            })
        }else{
            res.json({status: false, message: "Unauthorized Access"})
        }
    })

    app.post('/api/guards/edit',(req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'],config.secret)
        if(decoded.role == 'Admin'){
            Guard.find({
                _id: {$ne: req.body._id},
                userId: req.body.userId
            }).then((docs)=>{
                if(docs.length>0){
                    res.json({status: false, message: "UserId is repeating"})
                }else{
                    Guard.updateOne({
                        _id: req.body._id
                    },req.body).then((doc)=>{
                        res.json({status: true, message: "Guard Edited Successfully"})
                    }).catch((error)=>{
                        res.json({status: false, message: "Internal Error Ouccered.", error: error})
                    })
                }
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error Ouccered.", error: error})
            })
        }else{
            res.json({status: false, message: "Unauthorized Access"})
        }
    })

    app.post('/api/guards/delete', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role=='Admin'){
            Guard.deleteOne({
                _id: req.body._id
            }).then((data)=>{
                res.json({status: true, message: "Guard Deleted Successfully"})
            }).catch((error)=>{
                res.json({status: false, message: "Internal Error Ouccered.", error: error})
            })
        }else{
            res.json({status: false, message: "Unauthorized Access"})
        }
    })

    
}