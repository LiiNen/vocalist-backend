var mysql = require('mysql');

const config = require('./config');
var pool  = mysql.createPool(config);
  
function getConnection(callback) {
  pool.getConnection(function(err, connection) {
    if(!err) {
      callback(connection);
      return;
    }
  });
}

module.exports = getConnection;