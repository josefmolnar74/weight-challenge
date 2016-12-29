//  OpenShift sample Node application
var express     = require('express'),
    fs          = require('fs'),
    app         = express(),
    eps         = require('ejs'),
    server      = require('http').Server(app),
    io          = require('socket.io')(server),
    controller  = require('./controller/controller.js'),
    morgan      = require('morgan');

Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

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
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initializeSocket();

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
