
/**
 * /friend
 * [GET] user_id => get friends list(id, name)
 * [POST] user_id, email => add friend state (user_id for apply, email for response user)
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.get('/', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select friend_id, accept from (
                  (select user_id_response as friend_id, accept from friend where user_id_apply=${user_id}
                  union
                  select user_id_apply as friend_id, accept from friend where user_id_response=${user_id})
                as friend_list);`;
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
  });
  
  router.post('/', (req, res) => {
    var user_id = req.body.user_id;
    var email = req.body.email;
    var query = `insert into friend(user_id_apply, user_id_response, accept) select ${user_id}, id, 0 from user where user.email=\"${email}\";`;
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
  });

  return router;
}