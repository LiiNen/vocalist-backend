
module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.patch('/music/number', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var number = req.body.number;

    var query = `update music set number = ${number} where itunes_id=${itunes_id}`;
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