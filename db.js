var mysql = require('mysql');

var DB_HOST =  process.env.DB_HOST
var DB_USERNAME = process.env.DB_USERNAME
var DB_USERPASSWORD = process.env.DB_PASSWORD
var DB_DATABASE = process.env.DB_DATABASE

//mysql://b2f92b012a3528:fef4f60d@us-cdbr-iron-east-04.cleardb.net/heroku_e68a2593eaec1f5?reconnect=true
var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-04.cleardb.net',
  user     : 'b2f92b012a3528',
  password : 'fef4f60d',
//  database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  database : 'heroku_e68a2593eaec1f5'
});

/*
var connection = mysql.createConnection({
  host     : DB_HOST,
  user     : DB_USERNAME,
  password : DB_USERPASSWORD,
//  database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  database : DB_DATABASE
});
*/
/**
 *  Connect to mysql database.
 */
exports.connect = function (mode, done) {
      console.log('[JOSEF] Connect to mysql database');
      console.log(process.env.DATABASE_URL)
      connection.connect(function(err) {
        if (err) {
          console.error('[JOSEF] error connecting: ' + err.stack);
            return done(new Error('[JOSEF] Missing database connection.'));
        };
        done()
      });
};

exports.get = function (){
//      console.log('[josef] get connection');
      return connection;
};
