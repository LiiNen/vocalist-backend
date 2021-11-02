module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var id = req.query.id;
    var query = `select * from user where id=${id}`;

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

  router.post('/', (req, res) => {
    var emoji = req.body.emoji;
    var query = `insert into user(email, name, type, emoji) values("test@ac.kr", "test", "google", \"${emoji}\")`;

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
            'body': 'select fin'
          })
        }
      });
      connection.release();
    });
  });

  router.patch('/', (req, res) => {
    var id = req.body.id;
    var name = req.body.name;
    var query = `update user set name = \"${name}\" where id = ${id}`;

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
            'body': 'success change name'
          })
        }
      });
      connection.release();
    });
    
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from user where id=${id}`;

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
            'body': 'success withdrawal'
          });
        }
      });
      connection.release();
    });
  });

  return router;
}