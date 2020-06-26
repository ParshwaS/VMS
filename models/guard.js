const mongoose = require('mongoose')

var GuardSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    gate: {
        type: String,
        required: true
    }
})

mongoose.model('guard', GuardSchema)