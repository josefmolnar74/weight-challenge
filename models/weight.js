//var db = require('../db.js');
var pg = require('pg');
var async = require('async');

exports.create = function(object, callback) {
  console.log('[JOSEF] Create data')
  async.waterfall([
    async.apply(createWeightData, object),
    async.apply(getWeightData)
  ],
  function(err, results){
    if (err) return callback(err);
    callback(null, results);
  })
};

var createWeightData = function(object, callback) {
  var values = [object.person_id, object.weight, object.date];
  console.log("[JOSEF] Create weight with data = " + values)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('INSERT INTO weight (person_id, weight, date) VALUES($1, $2, $3) RETURNING weight_id', values, function (err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      console.log(result.rows[0])
      callback(null, result.rows[0]);
      done()
    });
  });
}

exports.get = function(object,callback){
  getWeightData(object,callback);
};

var getWeightData = function(object, callback) {
  console.log('[JOSEF] getWeightData')
  if (object.weight_id != null){
    getOneWeightData(object.weight_id, callback)
  } else if (object.person_id != null){
    getPersonWeightData(object.person_id, callback)
  } else console.log('[JOSEF] getWeightData something wrong')
};

var getOneWeightData = function(weight_id, callback) {
  console.log('[JOSEF] getOneWeightData for weight_id ' +weight_id)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('SELECT * FROM weight WHERE weight_id='+weight_id, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
      } return callback(err);
      console.log('[JOSEF] client query success');
      callback(null, result);
      done()
    });
  });
};

var getPersonWeightData = function(person_ID, callback) {
  console.log('[JOSEF] getPersonWeightData all for person ' +person_ID)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('SELECT * FROM weight WHERE person_ID ='+person_ID, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
      } return callback(err);
      console.log('[JOSEF] client query success');
      callback(null, result);
      done()
    });
  });
};

exports.update = function(object, callback) {
  console.log('[JOSEF] Update weight data')
  async.waterfall([
    async.apply(updateHealthdata, object),
    async.apply(getHealthdata)
  ],
  function(err, results){
    if (err) return callback(err);
    callback(null, results);
  })
};

updateWeightdata = function(object, callback) {
  console.log('[JOSEF] updateWeightdata, weight_id = '+object.weight_id)
  var values = [object.person_id, object.weight, object.date, object.weight_id];
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('UPDATE weight SET person_id=$1, weight=$2, date=$3 WHERE weight_id=$4', values, function(err, result) {
      console.log('[JOSEF] pg connect success');
      done()
      if (err){
        console.log('[JOSEF] client query failure');
      } return callback(err);
      console.log('[JOSEF] client query success');
      console.log("[JOSEF] user created with ID " +result.insertId)
      callback(null, result.insertId);
    });
  });
};

exports.delete = function(object, callback){
  console.log('[JOSEF] weight.delete, weight_id = '+object.weight_id);
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('DELETE FROM weight WHERE weight_id = $1', object.weight_id, function(err, result) {
      console.log('[JOSEF] pg connect success');
      done()
      if (err){
        console.log('[JOSEF] client query failure');
      } return callback(err);
      console.log('[JOSEF] client query success');
      callback(null, result);
    });
  });
};

exports.deleteAllWeightData = function(callback){
  console.log("[JOSEF] Delete all weight data");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('DELETE FROM weight',function(err, result) {
      console.log('[JOSEF] pg connect success');
      done()
      if (err){
        console.log('[JOSEF] client query failure');
      } return callback(err);
      console.log("[JOSEF] All weight data deleted");
      console.log('[JOSEF] client query success');
      callback(null, 'weightDeleted');
    });
  });
}
