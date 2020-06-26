const mongoose = require('mongoose')

var VisitorSchema = new mongoose.Schema({
    name: {
        type: String
    },
    registered_mob: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_in: {
        type: Boolean,
        required: true,
        default: false
    }
})

mongoose.model('visitor',VisitorSchema,'visitors')