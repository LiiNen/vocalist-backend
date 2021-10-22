module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.post('/', (req, res) => {
    var user_id = req.body.user_id;
    var title = req.body.title;
    var content = req.body.content;
    var query = `insert into bug_report(user_id, title, content)
                values(${user_id}, \"${title}\", \"${content}\")`;

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

  return router;
}