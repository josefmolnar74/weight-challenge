var pg = require('pg')

var async = require('async');

exports.checkLoginData = function(email, password, callback) {
  console.log("[JOSEF] checkLoginData, find email and password " + email + " " +password)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if(err){
      done()
      return callback(err);
    }
    client.query('SELECT * FROM persons WHERE email = %1 and password = %2', [email, password], function(err, result) {
      if (err) return callback(err);
      console.log("[JOSEF] findUser callback "+JSON.stringify(rows))
      callback(null, rows[0]);
      done()
    });
  });
}

exports.create = function(object, callback) {
  var values = [object.name, object.email, object.password, object.height];
  console.log("[JOSEF] Create person with data = " + values)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
      done()
    }
    client.query('INSERT INTO public.persons (name, email, password, height) VALUES($1, $2, $3, $4)', values, function (err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      console.log("[JOSEF] user created with ID " +result.insertId)
      callback(null, result.insertId);
      done()
    });
  });
}

exports.get = function(object, callback) {
  console.log('[JOSEF] persons.get')
  if (object.person_id != null){
    console.log('[JOSEF] persons.get with person_id = ', object.person_id)
    findPersonWithID(object.person_id, callback)
  }
  else if (object.email != null){
    console.log('[JOSEF] persons get with email = ', object.email)
    findPersonWithEmail(object.email, callback)
  }
  else {
     console.log('[JOSEF] person.get something wrong')
     callback(null,null)
  }
}

var findPersonWithID = function(person_id, callback) {
  console.log('[JOSEF] findPersonWithID for person_id ' +person_id)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      callback(err);
      done()
    }
    client.query('SELECT * FROM person WHERE person_id='+person_id, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      callback(null, result.rows);
      done()
    });
  });
};

var findPersonWithEmail = function(email, callback) {
  console.log('[JOSEF] findPersonWithEmail all for person with mail='+email)
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      done()
      return callback(err);
    }
    client.query('SELECT * FROM persons WHERE email='+email, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      callback(null, result.rows);
      done()
    });
  });
};

exports.update = function(object, callback) {
  console.log('[JOSEF] persons.update person='+object.person_id)
  async.waterfall([
    async.apply(updatePerson, object),
    async.apply(getPerson)
  ],
  function(err, results){
    if (err) return callback(err);
    callback(null, results);
  })
};

updatePerson = function(object, callback) {
  console.log('[JOSEF] updatePerson, person_id = '+object.person_id)
  var values = [object.name, object.email, object.password, object.height, object.person_id];
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('UPDATE person SET name=$1, email=$2, password=$3, height=$4 WHERE person_id=$5', values, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      console.log("[JOSEF] user updated ")
      callback(null, result.rows);
      done()
    });
  });
};

exports.update = function(object, callback) {
  if (object.password != null){
    // update person data
    console.log('[JOSEF] persons.update person data')
    var values = [object.name, object.email, object.avatar, object.person_id];
    db.get().query('UPDATE persons SET name=?, email=?, avatar=? WHERE person_id=?', values,
    function(err, result) {
      if (err) return callback(err)
      callback(null, result.insertId);
    });
  } else{
    // update password
    console.log('[JOSEF] persons.update password')
    var values = [object.password, object.person_id];
    db.get().query('UPDATE persons SET password=? WHERE person_id=?', values,
    function(err, result) {
      if (err) return callback(err)
      callback(null, result.insertId);
    });
  }
};

exports.delete = function(person_id, callback) {
  console.log('[JOSEF] persons.delete');
  async.waterfall([
    async.apply(deletePersonWeightData, person_id),
    async.apply(deletePerson, person_id)
  ],
  function(err, result){
    if (err) return callback(err);
    callback(null, result);
  })
};

var deletePersonWeightData = function(person_id, callback){
  console.log("[JOSEF] deleteWeightData for person " +person_id);
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('DELETE FROM weight WHERE person_id='+object.person_id, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      callback(null, result);
      done()
    });
  });
}

var deletePerson = function(person_id, result, callback){
  console.log("[JOSEF] deletePerson for user " + person_id);
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('DELETE FROM persons WHERE person_id='+object.person_id, function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      callback(null, result);
      done()
    });
  });
}

exports.deleteAllPersons = function(callback) {
  console.log("[JOSEF] Delete all persons ");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    if (err){
      done()
      console.log('[JOSEF] pg connect failure');
      console.log(err);
      return callback(err);
    }
    client.query('DELETE FROM persons', function(err, result) {
      console.log('[JOSEF] pg connect success');
      if (err){
        console.log('[JOSEF] client query failure');
        return callback(err);
      }
      console.log('[JOSEF] client query success');
      callback(null, result);
      done()
    });
  });
}
