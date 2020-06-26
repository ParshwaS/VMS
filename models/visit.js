const mongoose = require('mongoose')

var VisitSchema = new mongoose.Schema({
    dateTimeVisit: {
        type: Date,
        default: Date.now(),
        required: true
    },
    visitor: {
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        registered_number: {
            type: Number,
            required: true
        }
    },
    no_visitors: {
        type: Number,
        required: true
    },
    guard_in: { 
        _id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    gate_in: {
        type: String,
        required: true
    },
    guard_out: { 
        _id: {
            type: String
        },
        name: {
            type: String
        }
    },
    gate_out: {
        type: String
    }
})

mongoose.model('visit', VisitSchema, 'visits')