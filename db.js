var mysql = require('mysql');

var DB_HOST =  process.env.DATABASE_HOST
var DB_USERNAME = process.env.DATABASE_USERNAME
var DB_USERPASSWORD = process.env.DATABASE_PASSWORD
var DB_DATABASE = process.env.DATABASE_NAME

//mysql://b2f92b012a3528:fef4f60d@us-cdbr-iron-east-04.cleardb.net/heroku_e68a2593eaec1f5?reconnect=true
var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-04.cleardb.net',
  user     : 'b2f92b012a3528',
  password : 'fef4f60d',
//  database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  database : 'heroku_e68a2593eaec1f5'
});

/**
 *  Connect to mysql database.
 */
exports.connect = function (mode, done) {
      console.log('[JOSEF] connect to mysql database');

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
