const mongoose = require('mongoose')
const Visitor = mongoose.model('visitor')
const Visit = mongoose.model('visit')
const Conv = mongoose.model('conv')
const chat_file = './chat_config.json'
var chat_config = require(chat_file)
var QRCode = require('qrcode')
const jwt = require('jsonwebtoken')
const config = require('../config.json')
const fs = require('fs')

module.exports = function (app, io) {

    app.get('/api/chat/getConfig', (req, res) => {
        res.json(chat_config)
    })

    app.post('/api/chat/response', (req, res) => {
        let trial = false
        Conv.find({
            registered_no: parseInt(req.body.from.split('@')[0].substr(2))
        }).then((docs) => {
            if (docs && docs.length > 0) {
                if (docs[0].conversation == 'registering_1') {
                    Visitor.updateOne({
                        _id: docs[0].visitor_id
                    }, { name: req.body.message }).then((doc) => {
                        Conv.updateOne({
                            _id: docs[0]._id
                        }, { conversation: 'none' }).then((doc) => {
                            res.json({ send: true, to: req.body.from, message: chat_config.registration_done })
                        })
                    }).catch((error) => {
                        console.log(error)
                        res.json({ send: false })
                    })
                }else if(docs[0].conversation == 'none'){
                    trial = true
                }
            } else {
                trial = true
            }
            if(trial){
                Visitor.find({
                    registered_mob: parseInt(req.body.from.split("@")[0].substr(2))
                }).then((docs) => {
                    if (docs && docs.length > 0) {
                        if (chat_config.invoke_welcome.includes(req.body.message.toLowerCase())) {
                            res.json({ send: true, message: chat_config.welcome_message+"\n"+chat_config.registered_welcome, to: req.body.from })
                        }else if(req.body.message == "1"){
                            QRCode.toDataURL(docs[0]._id.toString(),function(err,url){
                                if(!err){
                                    res.json({send: true, message: chat_config.gatepass, file: true, image: url, to: req.body.from})
                                }else{
                                    console.log(err)
                                    res.json({send: false})
                                }
                            })
                        }
                    } else {
                        if (chat_config.invoke_welcome.includes(req.body.message.toLowerCase())) {
                            res.json({ send: true, message: chat_config.welcome_message + "\n" + chat_config.registration_message + "\n" + chat_config.registration_pending, to: req.body.from })
                        } else if (req.body.message == "1") {
                            var visitor = new Visitor({
                                registered_mob: parseInt(req.body.from.split("@")[0].substr(2)),
                                password: req.body.from.split("@")[0].substr(2)
                            })
                            visitor.save().then((doc) => {
                                var conv = new Conv({
                                    visitor_id: doc._id,
                                    registered_no: doc.registered_mob,
                                    conversation: 'registering_1'
                                })
                                conv.save().then((docu) => {
                                    res.json({ send: true, message: chat_config.registration_invoke_message + "\n" + chat_config.registration_name_req, to: req.body.from })
                                }).catch((erro) => {
                                    console.log(erro)
                                    res.json({ send: false })
                                })
                            }).catch((error) => {
                                console.log(error)
                                res.json({ send: false })
                            })
                        } else {
                            res.json({send: true, to: req.body.from, message: chat_config.welcome_message})
                        }
                    }
                })
            }
        })
    })

    app.get('/api/chat/getConfig',(req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role=='Admin'){
            res.json(chat_config)
        }else{
            res.json({error: "Unauthorized Access"})
        }
    })

    app.post('/api/chat/saveConfig', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role=='Admin'){
            chat_config = req.body
            fs.writeFileSync('api/chat_config.json',JSON.stringify(chat_config))
            res.json({status: true, message: "Updates Saved"})
        }else{
            res.json({error: "Unauthorized Access"})
        }
    })
}