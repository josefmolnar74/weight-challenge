var mysql = require('mysql');
//  , async = require('async')

var PRODUCTION_DB = 'weight_challenge'
//  , TEST_DB = 'app_test_database'

//exports.MODE_TEST = 'mode_test'
//exports.MODE_PRODUCTION = 'mode_production'
//var mode = exports.MODE_PRODUCTION;

// if OPENSHIFT env variables are present, use the available connection info:
/*var connectionString = "mysql://";
if(process.env.OPENSHIFT_MYSQL_DB_PASSWORD){
  connectionString = process.env.OPENSHIFT_MYSQL_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MYSQL_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MYSQL_DB_HOST + ':' +
  process.env.OPENSHIFT_MYSQL_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
} else {
  connectionString += 'admin2DlLfX8:SsmT4aGI5fyQ@' +'127.0.0.1:27017' +'/cancermeapp';
}
*/
var DB_HOST =  process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost'
var DB_USERNAME = process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'user1NQ'
var DB_USERPASSWORD = process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'H0DD7ACsMkALGc4L'
var DB_DATABASE = process.env.OPENSHIFT_MYSQL_DB_DATABASE || 'weight_challenge'

var connection = mysql.createConnection({
  host     : DB_HOST,
  user     : DB_USERNAME,
  password : DB_USERPASSWORD,
//  database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  database : DB_DATABASE
});

/**
 *  Connect to mysql database.
 */
exports.connect = function (mode, done) {
      console.log('[josef] connect to mysql database');
      console.log('[josef] Connection credentials:' +' ' +DB_HOST +', ' +DB_USERNAME +', ' +DB_USERPASSWORD +', ' +DB_DATABASE);

      connection.connect(function(err) {
        if (err) {
          console.error('[josef] error connecting: ' + err.stack);
            return done(new Error('[josef] Missing database connection.'));
        };
        done()
      });
};

exports.get = function (){
//      console.log('[josef] get connection');
      return connection;
};
