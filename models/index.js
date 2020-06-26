const mongoose = require('mongoose');

var url = "mongodb+srv://admin:admin@vms-3d0he.mongodb.net/VMS?retryWrites=true&w=majority"

mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify: false, useCreateIndex: true }, (err)=>{
    if(!err){
        console.log("Database connected...");
    }else{
        console.log("Error in connecting to Database");
    }
});

require('./visitors')
require('./conv_whatsapp')
require('./visit')
require('./admin')
require('./guard')