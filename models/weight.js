var db = require('../db.js');
var async = require('async');

exports.create = function(object, callback) {
  console.log('[CME] healthdata.create')
  async.waterfall([
    async.apply(createHealthdata, object),
    async.apply(getHealthdata)
  ],
  function(err, results){
    if (err) return callback(err);
    callback(null, results);
  })
};

var createHealthdata = function(object, callback){
  console.log("[CME] createHealthdata ")
  var values = [object.patient_ID, object.person_ID, object.date, object.time, object.type, object.value];
  db.get().query('INSERT INTO healthdata (patient_ID, person_ID, date, time, type, value) VALUES(?, ?, ?, ?, ?, ?)', values,
  function (err, result) {
    if (err) return callback(err);
    var resultObject = {healthdata_ID: result.insertId};
    console.log("[CME] healthdata created with ID " +resultObject.healthdata_ID)
    callback(null, resultObject);
  });
};

exports.get = function(object,callback){
  getHealthdata(object,callback);
};

var getHealthdata = function(object, callback) {
  console.log('[CME] getHealthdata')
  if (object.healthdata_ID != null){
    console.log('[CME] getHealthdata for healthdata_ID ' +object.healthdata_ID)
    db.get().query('SELECT * FROM healthdata WHERE healthdata_ID =?', object.healthdata_ID,
    function(err, result) {
      if (err) throw err;
      callback(null, result)
    });
  } else if (object.patient_ID != null){
    console.log('[CME] getHealthdata all for patient ' +object.patient_ID)
    db.get().query('SELECT * FROM healthdata WHERE patient_ID =?', object.patient_ID,
    function(err, result) {
      if (err) return callback(err);
      callback(null, result)
    });
  } else console.log('[CME] something wrong no getHealthdata db query')
};

exports.update = function(object, callback) {
  console.log('[CME] Update healthdata')
  async.waterfall([
    async.apply(updateHealthdata, object),
    async.apply(getHealthdata)
  ],
  function(err, results){
    if (err) return callback(err);
    callback(null, results);
  })
};

updateHealthdata = function(object, callback) {
  console.log('[CME] updateHealthdata, healthdata_ID = '+object.healthdata_ID)
  var values = [object.patient_ID, object.person_ID, object.date, object.time, object.type, object.value, object.healthdata_ID];
  db.get().query('UPDATE healthdata SET patient_ID=?, person_ID=?, date=?, time=?, type=?, value=? WHERE healthdata_ID = ?', values,
  function(err, result) {
    if (err) return callback(err)
    callback(null, object);
  });
};

exports.delete = function(object, callback){
  console.log('[CME] healthdata.delete, healthdata_ID = '+object.healthdata_ID);
  db.get().query('DELETE FROM healthdata WHERE healthdata_ID = ?', object.healthdata_ID,
  function(err, result) {
    if (err) throw err;
    callback(null, result)
  });
};

exports.deleteAllhealthdata = function(callback){
  console.log("[CME] Delete all healthdata");
  db.get().query('DELETE FROM healthdata',
  function(err, result) {
    if (err) return callback(err);
    console.log("[CME] All healthdata deleted");
    callback(null, 'healthdataDeleted');
  });
}
