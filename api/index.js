module.exports = function(app, io){
    require('./visitor')(app,io)
    require('./whatsapp')(app,io)
    require('./chat')(app,io)
    require('./page')(app,io)
    require('./login')(app,io)
    require('./guard')(app,io)
    require('./visit')(app,io)
}