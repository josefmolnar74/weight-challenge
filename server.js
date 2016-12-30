//  OpenShift sample Node application
var express     = require('express'),
    fs          = require('fs'),
    app         = express(),
    eps         = require('ejs'),
    server      = require('http').Server(app),
    io          = require('socket.io')(server),
    controller  = require('./controller/controller.js'),
    morgan      = require('morgan');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var initializeSocket = function() {
    console.log('[Josef] InitializeSocket');

    io.on('connection', function(socket){//Add socket
        console.log("[Josef] a user connected: " +socket.id);
        socket.emit('welcome', JSON.stringify({ message: 'Welcome! to Josef server', id: socket.id }));

        socket.on('login', function(data){
          var errorCode = "";
          console.log("[CME] Client login request");
          controller.checkLogin(data, function(err, rows){
            if(err) throw err;
            console.log(rows)
            if ((rows === null) || (rows === undefined)) errorCode = "login_failed";
            var dataMsg = JSON.stringify(createHdrJsonObject(data, errorCode)) +',' +JSON.stringify(rows);
            console.log('[CME] send data message =' +dataMsg)
            socket.emit('data', dataMsg);
          });
        });

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
};

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync('views/index_test.html'));
});


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initializeSocket();

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
