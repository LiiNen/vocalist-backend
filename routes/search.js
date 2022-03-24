
module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  var getObject = require('../object');
  
  router.get('/title', (req, res) => {
    var user_id = req.query.user_id;
    var input = req.query.input;
    var object = getObject('list');

    if(user_id) {
      var query = `select distinct ${object},
                    case when exists(select id from love where user_id=? and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where number is not null and youtube is not null and title like ?`;
      var params = [user_id, `%${input}%`];

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
    var object = getObject('list');

    if(user_id) {
      var query = `select distinct ${object},
                    case when exists(select id from love where user_id=? and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where number is not null and youtube is not null and artist like ?`;
      var params = [user_id, `%${input}%`];

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

    var query = `select * from curation where (title like ? or content like ?) and demo_type is null`;
    var params = [`%${input}%`, `%${input}%`];

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
            'body': results
          });
        }
      });
      connection.release();
    });
  });

  router.get('/user/email', (req, res) => {
    var user_id = req.query.user_id;
    var input = req.query.input;
    if(input.includes('@')) {
      input = input.split('@')[0];
    }
    var query = `select distinct U.id, U.name, type, emoji,
                CONCAT(LEFT('********', 8), '@', SUBSTRING_INDEX(email, '@', -1)) as email,
                  case when exists
                    (select user_id_response, user_id_apply from friend
                    where (user_id_apply=? and user_id_response=U.id and accept=1)
                      or (user_id_response=? and user_id_apply=U.id and accept=1))
                  then 1 else 0
                  end as is_friend
                from user U where email like ? and U.id != ?`;
    var params = [user_id, user_id, `%${input}%`, user_id];
    
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
            body: results
          })
        }
      });
      connection.release();
    });
  });

  router.get('/user/name', (req, res) => {
    var user_id = req.query.user_id;
    var input = req.query.input;
    var query = `select distinct U.id, U.name, type, emoji,
                CONCAT(LEFT('********', 8), '@', SUBSTRING_INDEX(email, '@', -1)) as email,
                  case when exists
                    (select user_id_response, user_id_apply from friend
                    where (user_id_apply=? and user_id_response=U.id and accept=1)
                      or (user_id_response=? and user_id_apply=U.id and accept=1))
                  then 1 else 0
                  end as is_friend
                from user U where name like ? and U.id != ?`;
    var params = [user_id, user_id, `%${input}%`, user_id];
    
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
            body: results
          })
        }
      });
      connection.release();
    });
  });
  
  return router;
}