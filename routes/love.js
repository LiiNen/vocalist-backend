
/**
 * /love
 * [POST] music_id, user_id => like music
 * [DELETE] music_id, user_id => dislike music
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.post('/', (req, res) => {
    var music_id = req.body.music_id;
    var user_id = req.body.user_id;
    var query = `insert into love(music_id, user_id) values(${music_id}, ${user_id})`;

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
            'body': 'like'
          })
        }
      });
      connection.release();
    });
    
  });
  
  router.delete('/', (req, res) => {
    var music_id = req.body.music_id;
    var user_id = req.body.user_id;
    var query = `delete from love where music_id=${music_id} and user_id=${user_id}`;
    
    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json('query error');
        }
        else {
          console.log(results);
          res.json({
            'status': true,
            'body': 'unlike'
          });
        }
      });
      connection.release();
    });
    
  });
  
  return router;
}