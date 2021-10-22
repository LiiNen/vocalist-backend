module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

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

  return router;
}