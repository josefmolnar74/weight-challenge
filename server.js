//  OpenShift sample Node application
var express = require('express'),
    fs      = require('fs'),
    app     = express(),
    eps     = require('ejs'),
    morgan  = require('morgan');

var server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.get('/', function (req, res) {
  res.render('index_test.html', { pageCountMessage : null});
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

io.set('transports', ['websocket']);

io.on('connection', function(socket){//Add socket
    console.log("[Josef] a user connected: " +socket.id);
    socket.emit('welcome', JSON.stringify({ message: 'Welcome! to Josef server', id: socket.id }));

    socket.on('read', function(data){
      var errorCode = "";
      console.log('[Josef] Recieved get '+data);
      controller.read(data, function(err, rows){
        if(err) throw err;
        console.log('[Josef] show rows result ')
        if ((rows === null) || (rows === undefined)) errorCode = "not_found";
        var responseHdr = createHdrJsonObject(data, errorCode);
        var responseMsg = createMsgJsonString(rows, responseHdr);
        console.log('[Josef] send data message =' +responseMsg)
        socket.emit('data', responseMsg);
      });
    });

    socket.on('create', function(data){
      var errorCode = "";
      console.log('[Josef] Recieved create '+data);
      controller.create(data, function(err, rows){
        if(err) throw err;
        if ((rows === null) || (rows === undefined)) errorCode = "already_exists";
        var responseHdr = createHdrJsonObject(data, errorCode);
        var responseMsg = createMsgJsonString(rows, responseHdr);
        console.log('[Josef] send data message =' +responseMsg)
        socket.emit('data', responseMsg);
      });
    });

    socket.on('delete', function(data){
      var errorCode = "";
      console.log('[Josef] Recieved delete '+data);
      controller.delete(data, function(err, rows){
        if(err) throw err;
        var responseHdr = createHdrJsonObject(data, errorCode);
        var responseMsg = createMsgJsonString(rows, responseHdr);
        console.log('[Josef] send data message =' +responseMsg)
        socket.emit('data', responseMsg);
      });
    });

    socket.on('update', function(data){
      var errorCode = "";
      console.log('[Josef] Recieved update '+data);
      controller.update(data, function(err, rows){
        if(err) throw err;
        var responseHdr = createHdrJsonObject(data, errorCode);
        var responseMsg = createMsgJsonString(rows, responseHdr);
        console.log('[Josef] send data message =' +responseMsg)
        socket.emit('data', responseMsg);
      });
    });

    socket.on('disconnect', function(){
      console.log("[Josef] Client disconnected")});
});

io.on('data', function(data) {
    console.log('[Josef] Data recieved');
    console.log(data);
});

io.on('disconnect', function(data) {
    console.log("[Josef] Client disconnected 2");
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
