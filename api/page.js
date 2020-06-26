const fs = require('fs')
const homefile = './homepage_config.json'
var homeConfig = require(homefile)
const config = require('../config.json')
const jwt = require('jsonwebtoken')

module.exports = function(app,io){

    app.get('/api/pages/home', (req,res)=>{
        res.json(homeConfig)
    })

    app.post('/api/page/changeHome', (req,res)=>{
        var decoded = jwt.verify(req.headers['authorization'], config.secret)
        if(decoded.role == 'Admin'){
            homeConfig = req.body;
            fs.writeFileSync('api/homepage_config.json', JSON.stringify(homeConfig))
            res.json({status: true, message: "Updated Successfully"})
        }else{
            res.json({status: false, message: "Unauthorized Access"})
        }
    })

}