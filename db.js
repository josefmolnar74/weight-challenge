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

/*
var mysqlURL = process.env.OPENSHIFT_MYSQL_DB_URL || process.env.MYSQL_URL,
    mysqlURLLabel = "";

var mysqlServiceName = process.env.DATABASE_SERVICE_NAME,
    mysqlHost = process.env.DATABASE_SERVICE_NAME + '_SERVICE_HOST'],
    mysqlPort = process.env[mysqlServiceName + '_SERVICE_PORT'],
    mysqlDatabase = process.env[mysqlServiceName + '_DATABASE'],
    mysqlPassword = process.env[mysqlServiceName + '_PASSWORD'],
    mysqlUser = process.env[mysqlServiceName + '_USER'];
*/
console.log('Connection credentials:')
console.log(process.env.OPENSHIFT_MYSQL_DB_HOST)
console.log(process.env.OPENSHIFT_MYSQL_DB_USERNAME)
console.log(process.env.OPENSHIFT_MYSQL_DB_PASSWORD)
console.log(process.env.OPENSHIFT_MYSQL_DB_PORT)
console.log(process.env.OPENSHIFT_APP_NAME)

var connection = mysql.createConnection({
  host     : process.env.OPENSHIFT_MYSQL_DB_HOST,
  user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME,
  password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD,
  port     : process.env.OPENSHIFT_MYSQL_DB_PORT,
  database : process.env.OPENSHIFT_APP_NAME
});

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
