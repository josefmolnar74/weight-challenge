#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var assert = require('assert');
var io = require('socket.io');
var controller = require('./controller/controller.js');
var morgan = require('morgan');

Object.assign=require('object-assign')

 /**
 *  Define the sample application.
 */

 var SampleApp = function() {
    //  Scope.
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
        self.port      = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
//        self.zcache['index.html'] = fs.readFileSync('./index.html');
        self.zcache['index.html'] = fs.readFileSync('views/index_test.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
     //Här sätter jag upp metoder för interaktion med
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.server = require('http').Server(self.app);
        self.io = require('socket.io')(self.server);
        self.app.engine('html', require('ejs').renderFile);
        self.app.use(morgan('combined'))
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        };
    };

    self.initializeSocket = function() {

        self.io.on('connection', function(socket){//Add socket
            console.log("[Josef] a user connected: " +socket.id);
            socket.emit('welcome', JSON.stringify({ message: 'Welcome! to Josef server', id: socket.id }));

            socket.on('login', function(data){
              var errorCode = "";
              console.log("[Josef] Client login request");
              controller.checkLogin(data, function(err, rows){
                if(err) throw err;
//                if (rows == undefined) rows = ["Login failed"];
                console.log(rows)
                if ((rows === null) || (rows === undefined)) errorCode = "login_failed";
                var dataMsg = JSON.stringify(createHdrJsonObject(data, errorCode)) +',' +JSON.stringify(rows);
                console.log('[Josef] send data message =' +dataMsg)
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

        self.io.on('data', function(data) {
            console.log('[Josef] Data recieved');
            console.log(data);
        });

        self.io.on('disconnect', function(data) {
            console.log("[Josef] Client disconnected 2");
        });
    };
    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
          self.setupVariables();
          self.populateCache();
          self.setupTerminationHandlers();
          // Create the express server and routes.
          self.initializeServer();
          // Create socket callbacks
          self.initializeSocket();

    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {

        //  Start the app on the specific interface (and port).
         self.server.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
        // Send current time every 10 secs
        setInterval(sendTime, 10000);
    };
};   /*  Sample Application.  */

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

// Send current time to all connected clients
function sendTime() {
   console.log('[Josef] sendTime io.emit');
    zapp.io.emit('time', "ping");
}

function createHdrJsonObject(data, error){
  var responseHeader = { message_ID: JSON.parse(data).message_ID,
                        function: JSON.parse(data).function,
                        content: JSON.parse(data).content,
                        errorCode: error};
  console.log('[Josef] create responseHeader')
  console.log(responseHeader)
  return responseHeader;
}

function createDataJsonObject(rows, content){
  var responseData;
  switch (content){
    case 'invite':
      responseData = {invite_data: rows};
      break

    case 'healthcare':
      responseData = {healthcare_data: rows};
      break;

    case 'event':
      responseData = {event_data: rows};
      break;

    case 'status':
      responseData = {status_data: rows};
      break;

    case 'beverage':
      responseData = {beverage_data: rows};
      break;

    case 'sideeffect':
      responseData = {sideeffect_data: rows};
      break;

    case 'healthdata':
      responseData = {healthdata_data: rows};
      break;

    case 'question':
      responseData = {question_data: rows};
      break;

    case 'article':
      responseData = {article_data: rows};
      break;

    case 'journal':
      responseData = {event_data: rows[0],
                      status_data: rows[1],
                      sideeffect_data: rows[2],
                      beverage_data: rows[3]};
      break;

  }
  return responseData;
};

function createMsgJsonString(rows, responseHdr){
  var responseMsg = "";
  if ((responseHdr.content == 'invite') ||
      (responseHdr.content == 'healthcare') ||
      (responseHdr.content == 'journal') ||
      (responseHdr.content == 'event') ||
      (responseHdr.content == 'status') ||
      (responseHdr.content == 'beverage') ||
      (responseHdr.content == 'question') ||
      (responseHdr.content == 'article') ||
      (responseHdr.content == 'healthdata') ||
      (responseHdr.content == 'sideeffect'))
  {
    // Package result rows into one data object, to manage JSON unpackage on the client side
    //only applicable for those data where rows > 1 (person and patient is excluded for now)
    var responseData = createDataJsonObject(rows,responseHdr.content)
    responseMsg = JSON.stringify(responseHdr) +',' +JSON.stringify(responseData);
  }
  else{
    responseMsg = JSON.stringify(responseHdr) +',' +JSON.stringify(rows);
  }
  return responseMsg;
}
