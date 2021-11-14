

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  
  router.get('/title', (req, res) => {
    var user_id = req.query.user_id;
    var input = req.query.input;

    if(user_id) {
      var query = `select distinct *,
                    case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where title like \'%${input}%\'`;

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

    }
    else res.json({
      'status': false,
      'log': 'wrong request param error'
    });
  });

  router.get('/artist', (req, res) => {
    var user_id = req.query.user_id;
    var input = req.query.input;

    if(user_id) {
      var query = `select distinct *,
                    case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where artist like \'%${input}%\'`;

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

    }
    else res.json({
      'status': false,
      'log': 'wrong request param error'
    });
  });

  router.get('/curation', (req, res) => {
    var input = req.query.input;

    if(user_id) {
      var query = `select * from curation where title like '%${input}%`;

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

    }
    else res.json({
      'status': false,
      'log': 'wrong request param error'
    });
  });

  return router;
}