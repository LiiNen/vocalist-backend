module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var query = `select user_id, br.email, name, title, content from bug_report as br, user where br.user_id = user.id`;

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
    })
  });

  router.post('/', (req, res) => {
    var user_id = req.body.user_id;
    var title = req.body.title;
    var content = req.body.content;
    var email = req.body.email;
    var query = `insert into bug_report(user_id, title, content, email)
                values(${user_id}, \"${title}\", \"${content}\", \"${email}\")`;

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
            'body': 'success post bug report'
          })
        }
      });
      connection.release();
    });
    
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;

    var query = `delete from bug_report where id = ${id}`;

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
            'body': 'delete succes'
          })
        }
      });
      connection.release();
    });
  });

  return router;
}