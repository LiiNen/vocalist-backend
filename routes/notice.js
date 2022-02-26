
module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('', (req, res) => {
    var query = `select * from notice order by date desc, is_open`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results
          });
        }
      });
      connection.release();
    });
  });

  router.get('/main', (req, res) => {
    var query = `select * from notice where is_open=1 order by date desc limit 1`;
    
    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results
          });
        }
        });
      connection.release();
    });
  });

  return router;
}
