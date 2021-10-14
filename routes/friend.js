
/**
 * /friend
 * [GET] user_id => get friends list(id, name)
 * [POST] user_id, email => add friend state (user_id for apply, email for response user)
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select friend_id, accept from (
                  (select user_id_response as friend_id, accept from friend where user_id_apply=${user_id}
                  union
                  select user_id_apply as friend_id, accept from friend where user_id_response=${user_id})
                as friend_list);`;

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
            'body': results
          });
        }
      });
      connection.release();
    });
  });
  
  router.post('/', (req, res) => {
    var user_id = req.body.user_id;
    var email = req.body.email;
    var query = `insert into friend(user_id_apply, user_id_response, accept) select ${user_id}, id, 0 from user where user.email=\"${email}\";`;
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
            'body': 'friend apply success'
          });
        }
      });
      connection.release();
    });
  });

  return router;
}