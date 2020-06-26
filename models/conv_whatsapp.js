const mongoose = require('mongoose')

var convSchema = new mongoose.Schema({
    visitor_id: {
        type: String,
        required: true
    },
    registered_no: {
        type: Number,
        required: true
    },
    conversation: {
        type: String,
        required: true,
        default: 'none'
    }
});

mongoose.model('conv', convSchema, 'conversation');