const mongoose = require('mongoose')
const Visitor = mongoose.model('visitor')
const Admin = mongoose.model('admin')
const Guard = mongoose.model('guard')
const jwt = require('jsonwebtoken')
const config = require('../config.json')

module.exports = function (app, io) {

	app.post('/api/auth/login', (req, res) => {
		if(req.body.role=='Visitor'){
			Visitor.findOne({
				registered_mob: req.body.userId
			}).then((doc) => {
				if (doc) {
					if (req.body.password == doc.password) {
						var payload = {
							_id: doc._id,
							role: 'Visitor',
							name: doc.name,
							userId: doc.registered_mob
						}
						let token = jwt.sign(payload, config.secret, {
							expiresIn: '20m'
						})
						res.json({ status: true, token: token })
					} else {
						res.json({ status: true, error: "We cannot authorize this account" })
					}
				} else {
					res.json({ status: true, error: "We cannot authorize this account" })
				}
			}).catch((error) => {
				console.log(error)
				res.json({ status: true, error: "We cannot authorize this account" })
			})
		}else if(req.body.role=='Admin'){
			Admin.findOne({
				userId: req.body.userId
			}).then((doc) => {
				if (doc) {
					if (req.body.password == doc.password) {
						var payload = {
							_id: doc._id,
							role: 'Admin',
							name: doc.name,
							userId: doc.userId
						}
						let token = jwt.sign(payload, config.secret, {
							expiresIn: '20m'
						})
						res.json({ status: true, token: token })
					} else {
						res.json({ status: true, error: "We cannot authorize this account" })
					}
				} else {
					res.json({ status: true, error: "We cannot authorize this account" })
				}
			}).catch((error) => {
				res.json({ status: true, error: "We cannot authorize this account" })
			})
		}else if(req.body.role=='Guard'){
			Guard.findOne({
				userId: req.body.userId
			}).then((doc) => {
				if (doc) {
					if (req.body.password == doc.password) {
						var payload = {
							_id: doc._id,
							role: 'Guard',
							name: doc.name,
							userId: doc.userId,
							gate: doc.gate
						}
						let token = jwt.sign(payload, config.secret, {
							expiresIn: '20m'
						})
						res.json({ status: true, token: token })
					} else {
						res.json({ status: true, error: "We cannot authorize this account" })
					}
				} else {
					res.json({ status: true, error: "We cannot authorize this account" })
				}
			}).catch((error) => {
				res.json({ status: true, error: "We cannot authorize this account" })
			})
		}else{
			res.json({
				status: false,
				error: 'Invalid role to login from'
			})
		}
	})

	app.post('/api/auth/register', (req,res)=>{
		var visitor = new Visitor(req.body)
		visitor.save().then((doc)=>{
			res.json({status: true, doc})
		}).catch((error)=>{
			res.json({status: false, message: "Internal Error"})
		})
	})

	app.get('/api/auth/refresh', (req, res) => {
		var decoded = jwt.verify(req.headers['authorization'], config.secret)
		var userPayload = {
			_id: decoded._id,
			name: decoded.name,
			userId: decoded.userId,
			role: decoded.role,
			gate: decoded.gate
		}
		let token = jwt.sign(userPayload, config.secret, {
			expiresIn: "20m"
		})
		res.json({ token: token })
	})

	app.post('/api/profile/changeName',(req,res)=>{
		var decoded = jwt.verify(req.headers['authorization'], config.secret);
		if(decoded.role=='Admin'){
			Admin.updateOne({
				_id: decoded._id
			},{name: req.body.name}).then((doc)=>{
				res.json({status:true, message: "Updated Successfully require logout"})
			}).catch((error)=>{
				res.json({status: false, message: "Internal Error Ouccered"})
			})
		}else if(decoded.role=='Visitor'){
			Visitor.updateOne({
				_id: decoded._id
			},{name: req.body.name}).then((doc)=>{
				res.json({status:true, message: "Updated Successfully require logout"})
			}).catch((error)=>{
				res.json({status: false, message: "Internal Error Ouccered"})
			})
		}else if(decoded.role=='Guard'){
			Guard.updateOne({
				_id: decoded._id
			},{name: req.body.name}).then((doc)=>{
				res.json({status:true, message: "Updated Successfully require logout"})
			}).catch((error)=>{
				res.json({status: false, message: "Internal Error Ouccered"})
			})
		}else{
			res.json({status: false, message: "You are trying inappropriate actions"})
		}
	})

	app.post('/api/profile/changePass',(req,res)=>{
		var decoded = jwt.verify(req.headers['authorization'], config.secret);
		if(decoded.role=='Admin'){
			Admin.findOne({
				_id: decoded._id
			}).then((doc)=>{
				if(doc.password==req.body.curPass){
					Admin.updateOne({
						_id: doc._id
					},{password: req.body.newPass}).then((doc)=>{
						res.json({status: true, message: "Password is updated."})
					}).catch((doc)=>{
						res.json({status: false, message: "Error while updating"})
					})
				}else{
					res.json({status: false, message: "Old Password doesn't match"})
				}
			}).catch((error)=>{
				res.json({status: false, message: "Internal Error Ouccered"})
			})
		}else if(decoded.role=='Visitor'){
			Visitor.findOne({
				_id: decoded._id
			}).then((doc)=>{
				if(doc.password==req.body.curPass){
					Visitor.updateOne({
						_id: doc._id
					},{password: req.body.newPass}).then((doc)=>{
						res.json({status: true, message: "Password is updated."})
					}).catch((doc)=>{
						res.json({status: false, message: "Error while updating"})
					})
				}else{
					res.json({status: false, message: "Old Password doesn't match"})
				}
			}).catch((error)=>{
				res.json({status: false, message: "Internal Error Ouccered"})
			})
		}else if(decoded.role=='Guard'){
			Guard.findOne({
				_id: decoded._id
			}).then((doc)=>{
				if(doc.password==req.body.curPass){
					Guard.updateOne({
						_id: doc._id
					},{password: req.body.newPass}).then((doc)=>{
						res.json({status: true, message: "Password is updated."})
					}).catch((doc)=>{
						res.json({status: false, message: "Error while updating"})
					})
				}else{
					res.json({status: false, message: "Old Password doesn't match"})
				}
			}).catch((error)=>{
				res.json({status: false, message: "Internal Error Ouccered"})
			})
		}else{
			res.json({status: false, message: "You are trying inappropriate actions"})
		}
	})
}