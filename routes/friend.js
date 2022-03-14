
/**
 * /friend
 * 
 * @Column
 * user_id_apply(int), user_id_response(int), accept(bool)
 * 
 * accept
 * 0 for not accepted yet
 * 1 for accepted (two users are friend)
 * delete the row for deletion friendship or denying
 * 
 * [GET] user_id => get friends list(id, name)
 * [POST] user_id, email => add friend state (user_id for apply, email for response user)
 * [DELETE] id => friend deny
 * [PATH] id => friend accept
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select friend_list.id, name, friend_id, accept, applier from
                  (select id, user_id_response as friend_id, accept, 1 as applier from friend where user_id_apply=?
                  union
                  select id, user_id_apply as friend_id, accept, 0 as applier from friend where user_id_response=?)
                as friend_list, user where user.id=friend_list.friend_id;`;
    var params = [user_id, user_id];

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

  router.post('/', (req, res) => {
    var user_id = req.body.user_id;
    var email = req.body.email;
    var query = `insert into friend(user_id_apply, user_id_response, accept)
                  select ?, id, 0 from user
                  where user.email=\"?\" and not exists(
                    select 1 from friend, user where user_id_apply=? and user_id_response=user.id and user.email=\"?\"
                    union
                    select 1 from friend, user where user_id_apply=user.id and user_id_response=? and user.email=\"?\"
                  );`;
    var params = [user_id, email, user_id, email, user_id, email];

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
            'body': 'friend apply success'
          });
        }
      });
      connection.release();
    });

  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from friend where id = ?`;

    getConnection(function(connection) {
      connection.query(query, [id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'friend delete success'
          });
        }
      });
      connection.release();
    });

  });

  router.patch('/', (req, res) => {
    var id = req.body.id;
    var query = `update friend set accept = 1 where id = ?`;
    
    getConnection(function(connection) {
      connection.query(query, [id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'friend accepted'
          });
        }
      });
      connection.release();
    });

  });

  return router;
}