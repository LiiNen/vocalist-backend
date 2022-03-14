module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var query = `select build from version where id=1`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results[0]
          })
        }
      });
      connection.release();
    });
  });

  //chart date version
  router.get('/chart', (req, res) => {
    var query = `select id, build from version where id=2 or id=3 order by id`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results
          })
        }
      });
      connection.release();
    });
  });

  router.patch('/chart', (req, res) => {
    var date = req.body.date;
    var id = req.body.id;
    var query = `update version set build=\"?\" where id=?`;
    var params = [date, id];

    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'success'
          })
        }
      });
      connection.release();
    });
  });

  router.get('/maintenance', (req, res) => {
    var query = `select build from version where id = 4`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results[0]
          })
        }
      });
      connection.release();
    });
  });

  router.patch('/maintenance', (req, res) => {
    var build = req.body.build;
    var query = `update version set build = ? where id = 4`;

    getConnection(function(connection) {
      connection.query(query, [build], function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'success'
          })
        }
      });
      connection.release();
    });
  });
  
  return router;
}