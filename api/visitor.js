const mongoose = require('mongoose')
const Visitor = mongoose.model('visitor')
const Visit = mongoose.model('visit')
const jwt = require('jsonwebtoken')
const config = require('../config.json')
const bcrypt = require('bcryptjs')
const QRCode = require('qrcode')
var chat_config = require('./chat_config.json')

module.exports = function (app, io) {
	//getting list of visitors
	app.get('/api/visitors/list', (req, res) => {
		var decoded = jwt.verify(req.headers['authorization'], config.secret);
		if(decoded.role=='Admin'){
			Visitor.find({}).then((docs) => {
				res.json({ status: true, docs })
			}).catch((error) => {
				res.json({ status: false, error })
			})
		}
	});

	app.post('/api/visitors/register', (req, res) => {
		Visitor.find({
			registered_mob: req.body.number
		}).then((docs) => {
			if (docs.length > 0) {
				res.json({ status: false, error: "The number is already registered" })
			} else {
				var visitor = new Visitor({
					registered_mob: req.body.number,
					name: req.body.name,
					password: password
				})
				visitor.save().then((doc) => {
					res.json({ status: true, doc })
				}).catch((error) => {
					res.json({ status: false, error })
				})
			}
		})
	})

	app.post('/api/visitors/get', (req, res) => {
		var decoded = jwt.verify(req.headers['authorization'], config.secret)
		Visitor.findOne({
			_id: req.body.id
		}).then((doc) => {
			res.json({ status: true, doc })
		}).catch((error) => {
			res.json({ status: false, error })
		})
	})

	app.post('/api/visitors/delete', (req, res) => {
		var decoded = jwt.verify(req.headers['authorization'], config.secret)
		if(decoded.role=='Admin'){
			Visitor.deleteOne({
				_id: req.body.id
			}).then((doc) => {
				res.json({ status: true, message: "Deleted Successfully" })
			}).catch((error) => {
				res.json({ status: false, error })
			})
		}
	})

	app.post('/api/visitors/getGatepass', (req, res) => {
		var decoded = jwt.verify(req.headers['authorization'], config.secret)
		Visitor.find({
			_id: decoded._id
		}).then((docs) => {
			QRCode.toDataURL(docs[0]._id.toString(), function (err, url) {
				if (!err) {
					res.json({ status: true, data: url })
				} else {
					console.log(err)
					res.json({ status: false })
				}
			})
		})
	})

	app.post('/api/visitors/visited', (req, res) => {
		chat_config = require('./chat_config.json')
		var decoded = jwt.verify(req.headers['authorization'], config.secret)
		if (decoded.role == 'Guard') {
			var visit = new Visit()
			visit.guard_in = req.body.guard
			visit.gate_in = req.body.gate
			visit.no_visitors = req.body.no_visitors
			visit.visitor = {
				name: req.body.visitor.name,
				_id: req.body.visitor._id,
				registered_number: req.body.visitor.registered_mob
			}
			visit.save().then((doc) => {
				Visitor.updateOne({
					_id: req.body.visitor._id
				}, { is_in: true }).then((doc) => {
					io.emit("sendMessage", {to: "91"+req.body.visitor.registered_mob+"@c.us", message: chat_config.when_enters})
					res.json({ status: true, message: "Visitor's visit is started" })
				}).catch((error) => {
					res.json({ status: false, message: "Internal Error.", error: error })
				})
			}).catch((error) => {
				res.json({ status: false, message: "Internal Error.", error: error })
			})
		} else {
			res.json({ status: false, message: "Unauthorized Access" })
		}
	})

	app.post('/api/visitors/visitOver', (req, res) => {
		chat_config = require('./chat_config.json')
		var decoded = jwt.verify(req.headers['authorization'], config.secret)
		if (decoded.role == 'Guard') {
			Visit.updateOne({
				"visitor._id": req.body.visitor._id,
				"guard_out": null
			},{
				guard_out: req.body.guard,
				gate_out: req.body.gate
			}).then((doc) => {
				Visitor.updateOne({
					_id: req.body.visitor._id
				}, { is_in: false }).then((doc) => {
					io.emit("sendMessage", {to: "91"+req.body.visitor.registered_mob+"@c.us", message: chat_config.when_leaves})
					res.json({ status: true, message: "Visitor's visit is completed" })
				}).catch((error) => {
					res.json({ status: false, message: "Internal Error.", error: error })
				})
			}).catch((error) => {
				res.json({ status: false, message: "Internal Error.", error: error })
			})
		} else {
			res.json({ status: false, message: "Unauthorized Access" })
		}
	})

}