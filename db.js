var mysql = require('mysql');

var PRODUCTION_DB = 'weight_challenge'

var mysqlURL = process.env.OPENSHIFT_MYSQL_DB_URL || process.env.MYSQL_URL,
    mysqlURLLabel = "";

if (mysqlURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mysqlServiceName = process.env.DATABASE_SERVICE_NAME;
  mysqlServiceName = mysqlServiceName.toUpperCase();

  var mysqlHost = process.env[mysqlServiceName + '_SERVICE_HOST'],
      mysqlPort = process.env[mysqlServiceName + '_SERVICE_PORT'],
      mysqlDatabase = process.env[mysqlServiceName + '_DATABASE'],
      mysqlPassword = process.env[mysqlServiceName + '_PASSWORD'],
      mysqlUser = process.env[mysqlServiceName + '_USER'];

  if (mysqlHost && mysqlPort && mysqlDatabase) {
    mysqlURLLabel = mysqlURL = 'mysqldb://';
    if (mysqlUser && mysqlPassword) {
      mysqlURL += mysqlUser + ':' + mysqlPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mysqlURLLabel += mysqlHost + ':' + mysqlPort + '/' + mysqlDatabase;
    mysqlURL += mysqlHost + ':' +  mysqlPort + '/' + mysqlDatabase;
  }
}

var mysql = require('mysql');
//  , async = require('async')

var PRODUCTION_DB = 'cancermeapp'
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
/*
var connection = mysql.createConnection({
  host     : mysqlHost,
  user     : mysqlUser,
  password : mysqlPassword,
  port     : mysqlPort,
  database : mysqlDatabase,
});
*/

/*
 var connection = mysql.createConnection({
  host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
  user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME,
  password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
  port     : process.env.OPENSHIFT_MYSQL_DB_PORT,
  database : process.env.OPENSHIFT_MYSQL_DB_DATABASE
 });
*/

/**
 *  Connect to mysql database.
 */
exports.connect = function (mode, done) {
      console.log('[josef] connect to mysql database');

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
