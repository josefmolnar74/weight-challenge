#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var assert = require('assert');
var db = require('./db.js');
var controller = require('./controller/controller.js');
var util = require('util');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendFile('views/index_test.html', { root : __dirname});
});

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

http.listen(app.get('port'), function() {
 console.log('[JOSEF] Node app is running on port', app.get('port'));
});

//Connect to mongodb database

//db.connect(db.MODE_PRODUCTION, function(err){
//  console.log("[JOSEF] Connected to MySQL");
//  if(err) throw err;
//});

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
    case 'weight':
      responseData = {weight_data: rows};
      break
  }
  return responseData;
};

function createMsgJsonString(rows, responseHdr){
  var responseMsg = "";
  if ((responseHdr.content == 'weight'))
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
