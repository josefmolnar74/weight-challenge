var pg = require('pg')

var async = require('async');

exports.checkLoginData = function(email, password, callback) {
  console.log("[JOSEF] checkLoginData, find email and password " + email + " " +password)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM persons WHERE email = ? and password = ?', [email, password], function(err, rows) {
      if (err) return callback(err);
      console.log("[CME] findUser callback "+JSON.stringify(rows))
      callback(null, rows[0]);
    });
  });
}

exports.create = function(object, callback) {
  var values = [object.name, object.email, object.password, object.height];
  console.log("[JOSEF] create person " + values)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('INSERT INTO persons (name, email, password, height) VALUES(?, ?, ?, ?)', values,
    function (err, result) {
      if (err) return callback(err);
      console.log("[JOSEF] user created with ID " +result.insertId)
      callback(null, result.insertId);
    });
  });
}

/*
exports.create = function(object, callback) {
  console.log('[CME] persons.create');
  async.waterfall([
    async.apply(findUserWithEmail, object),
    async.apply(createUser, object),
    async.apply(buildResultData)
  ],
  function(err, result){
    if (err) return callback(err);
    callback(null, result);
  })
};
*/
var findUserWithEmail = function(object, callback){
  console.log("[CME] findUserWithEmail with email = " + object.email)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM persons WHERE email = ?', [object.email], function(err, result) {
      if (err) return callback(err);
      console.log('[CME] findUserWIthEmail result = '+result[0])
      callback(null, result[0])
    });
  });
}

var createUser = function(object, result, callback){
  var userExist = false;
  if (result !== undefined) userExist = true;
  console.log('[CME] userExist ='+userExist)
  if (userExist) return callback(null,null) //Person with email already exist
  var values = [object.name, object.email, object.password, object.avatar];
  console.log("[CME] create person " + values)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('INSERT INTO persons (name, email, password, avatar) VALUES(?, ?, ?, ?)', values,
    function (err, result) {
      if (err) return callback(err);
      console.log("[CME] user created with ID " +result.insertId)
      callback(null, result.insertId);
    });
  });
}

var buildResultData = function(personID, callback){
  if ((personID === null) || (personID === 0)){
    console.log("[CME] personID == null")
    callback(null,null); // user already exist no need to do more
  } else{
    var object = {person_ID: personID}
    async.waterfall([
      async.apply(findUserWithID, object),
      async.apply(getPatientsForUser)
  //    async.apply(addToCareTeam, object.patient_ID, object.relationship, object.admin)
    ],
    function(err, result){
      if (err) return callback(err);
      callback(null, result);
    })
  }
};

exports.getPerson = function(object, callback) {
  if (object.person_ID != null){
    console.log('[CME] persons.get with person_ID = ', object.person_ID)
    async.waterfall([
      async.apply(findUserWithID, object)
    ],
    function(err, result){
      if (err) return callback(err);
      callback(null, result);
    })
    db.get().query('SELECT * FROM persons WHERE person_ID = ?', object.person_ID, function(err, rows) {
      if (err) throw err;
      callback(null, rows)
    });
  }
  else if (object.email != null){
    console.log('[CME] persons get with email = ', object.email)
    async.waterfall([
      async.apply(findUserWithEmail, object)
    ],
    function(err, result){
      if (err) return callback(err);
      callback(null, result);
    })
  }
  else callback(null, null);
}

exports.getAll = function(callback) {
  console.log('[CME] persons.getAll')
  db.get().query('SELECT * FROM persons',
  function(err, rows) {
    if (err) return callback(err);
    callback(null, rows)
  });
};

exports.update = function(object, callback) {
  if (object.password != null){
    // update person data
    console.log('[CME] persons.update person data')
    var values = [object.name, object.email, object.avatar, object.person_ID];
    db.get().query('UPDATE persons SET name=?, email=?, avatar=? WHERE person_ID=?', values,
    function(err, result) {
      if (err) return callback(err)
      callback(null, result.insertId);
    });
  } else{
    // update password
    console.log('[CME] persons.update password')
    var values = [object.password, object.person_ID];
    db.get().query('UPDATE persons SET password=? WHERE person_ID=?', values,
    function(err, result) {
      if (err) return callback(err)
      callback(null, result.insertId);
    });
  }
};

exports.delete = function(person_ID, callback) {
  console.log('[CME] persons.delete');
  async.waterfall([
    async.apply(deleteRelationships, person_ID),
    async.apply(deletePerson, person_ID)
  ],
  function(err, result){
    if (err) return callback(err);
    callback(null, result);
  })
};

var deleteRelationships = function(person_ID, callback){
  console.log("[CME] deleteRelationships for user " + person_ID);
  db.get().query('DELETE FROM persons_patients_junction WHERE person_ID = ?', person_ID, function(err, result) {
    if (err) return callback(err);
    console.log("[CME] relationships deleted for user " +person_ID);
    callback(null, result);
  });
}

var deletePerson = function(person_ID, result, callback){
  console.log("[CME] deletePerson for user " + person_ID);
  db.get().query('DELETE FROM persons WHERE person_ID = ?', person_ID, function(err, result) {
    if (err) return callback(err);
    console.log("[CME] person deleted");
    callback(null, result);
  });
}

exports.deleteAllPersons = function(callback) {
  console.log("[CME] Delete all persons ");
  db.get().query('DELETE FROM persons',
  function (err, rows) {
    if (err) return callback(err)
    callback(null,rows);
  });
}

exports.deleteAllJunctions = function(callback) {
  console.log("[CME] Delete all junctions ");
  db.get().query('DELETE FROM persons_patients_junction',
  function (err, rows) {
    if (err) return callback(err)
    callback(null,rows);
  });
}
