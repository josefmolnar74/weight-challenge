var pg = require('pg')

var async = require('async');

exports.checkLoginData = function(email, password, callback) {
  console.log("[JOSEF] checkLoginData, find email and password " + email + " " +password)
  pg.connect(process.env.DATABASE_URL, function(err, client, callback) {
    if(err) return callback(err);
    client.query('SELECT * FROM persons WHERE email = ? and password = ?', [email, password], function(err, rows) {
      if (err) return callback(err);
      console.log("[JOSEF] findUser callback "+JSON.stringify(rows))
      callback(null, rows[0]);
    });
  });
}

exports.create = function(object, callback) {
  var values = [object.name, object.email, object.password, object.height];
  console.log("[JOSEF] Create person with data = " + values)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('INSERT INTO public.persons (name, email, password, height) VALUES(?, ?, ?, ?)', values, function (err, result) {
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
}

exports.getPerson = function(object, callback) {
  if (object.person_ID != null){
    console.log('[JOSEF] persons.get with person_ID = ', object.person_ID)
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
    console.log('[JOSEF] persons get with email = ', object.email)
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

exports.update = function(object, callback) {
  if (object.password != null){
    // update person data
    console.log('[JOSEF] persons.update person data')
    var values = [object.name, object.email, object.avatar, object.person_ID];
    db.get().query('UPDATE persons SET name=?, email=?, avatar=? WHERE person_ID=?', values,
    function(err, result) {
      if (err) return callback(err)
      callback(null, result.insertId);
    });
  } else{
    // update password
    console.log('[JOSEF] persons.update password')
    var values = [object.password, object.person_ID];
    db.get().query('UPDATE persons SET password=? WHERE person_ID=?', values,
    function(err, result) {
      if (err) return callback(err)
      callback(null, result.insertId);
    });
  }
};

exports.delete = function(person_ID, callback) {
  console.log('[JOSEF] persons.delete');
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
  console.log("[JOSEF] deleteRelationships for user " + person_ID);
  db.get().query('DELETE FROM persons_patients_junction WHERE person_ID = ?', person_ID, function(err, result) {
    if (err) return callback(err);
    console.log("[JOSEF] relationships deleted for user " +person_ID);
    callback(null, result);
  });
}

var deletePerson = function(person_ID, result, callback){
  console.log("[JOSEF] deletePerson for user " + person_ID);
  db.get().query('DELETE FROM persons WHERE person_ID = ?', person_ID, function(err, result) {
    if (err) return callback(err);
    console.log("[JOSEF] person deleted");
    callback(null, result);
  });
}

exports.deleteAllPersons = function(callback) {
  console.log("[JOSEF] Delete all persons ");
  db.get().query('DELETE FROM persons',
  function (err, rows) {
    if (err) return callback(err)
    callback(null,rows);
  });
}

exports.deleteAllJunctions = function(callback) {
  console.log("[JOSEF] Delete all junctions ");
  db.get().query('DELETE FROM persons_patients_junction',
  function (err, rows) {
    if (err) return callback(err)
    callback(null,rows);
  });
}
