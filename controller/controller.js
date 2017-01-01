var persons = require('../models/persons.js');
var weight = require('../models/weight.js');
var async = require('async');

exports.checkLogin = function(data, done){
  var object = JSON.parse(data);
      console.log('[JOSEF] check login');
      persons.checkLoginData(object.email, object.password, function(err, rows){
        if (err) return done(err);
        done(null,rows);
      });
};

exports.create = function(data, done){
  var object = JSON.parse(data);
  switch (object.content){

    case 'person':
      console.log('[JOSEF] Create person data');
      persons.create(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;

    case 'weight':
      console.log('[JOSEF] Create weight data');
      weight.create(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;
  };
};

exports.read = function(data, done){
  var object = JSON.parse(data);
  console.log(object)
  switch (object.content){

    case 'person':
      console.log('[JOSEF] Get person')
      persons.getPerson(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;

    case 'weight':
      console.log('[JOSEF] Get weight data for', +object.person_ID);
      weight.get(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;
  };
};

exports.update = function(data, done){
  var object = JSON.parse(data);
  switch (object.content){
    case 'person':
      console.log('[JOSEF] Update person data');
      persons.update(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;

    case 'weight':
      console.log('[JOSEF] Update weight data');
      weight.update(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;

  };
};

exports.delete = function(data, done){
  var object = JSON.parse(data);
  switch (object.content){
    case 'person':
      console.log('[JOSEF] delete person');
      persons.delete(object.person_ID, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;

    case 'weight':
      console.log('[JOSEF] delete weight');
      weight.delete(object, function(err, rows){
        if (err) return done(err);
        done(null, rows);
      });
      break;

    case 'blackhole':
      console.log('[JOSEF] persons.deleteAll');
      async.series([
        persons.deleteAllPersons,
        weight.deleteAllWeight
      ],
      function(err, results){
        console.log('[JOSEF] all delete completed')
        if (err) return done(err);
        done(null, results);
      })
    break;

  };
};
