module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var id = req.query.id;
    var query = `select * from user where id=?`;

    getConnection(function(connection) {
      connection.query(query, [id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results[0]
          });
        }
      });
      connection.release();
    });
  });

  router.patch('/', (req, res) => {
    var id = req.body.id;
    var name = req.body.name;
    var emoji = req.body.emoji;
    var query = `update user set name=?, emoji=? where id=?`;
    var params = [name, emoji, id];

    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'success change name'
          });
        }
      });
      connection.release();
    });
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from user where id=?`;

    getConnection(function(connection) {
      connection.query(query, [id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'success withdrawal'
          });
        }
      });
      connection.release();
    });
  });

  router.get('/find', (req, res) => {
    var email = req.query.email;
    var query = `select name from user where email=?`;

    getConnection(function(connection) {
      connection.query(query, [email], function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          if(results.length == 0) {
            res.json({
              'status': true,
              'body': {
                'exist': false,
                'data': null
              }
            });
          }
          else res.json({
            'status': true,
            'body': {
              'exist': true, 
              'data': results[0]
            }
          });
        }
      });
      connection.release();
    });
  });

  return router;
}