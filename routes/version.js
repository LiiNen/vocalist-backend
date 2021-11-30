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
  
  return router;
}