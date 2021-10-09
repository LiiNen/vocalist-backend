/**
 * /playlist
 * [GET] user_id => get playlist of userid
 * [POST] user_id, title, visible => create playlist with userid
 * [DELETE] id => delete playlist of id(playlist)
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.get('/', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select id, title from playlist where user_id=${user_id}`;
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
    var title = req.body.title;
    var visible = req.body.visible;
    var query = `insert into playlist(user_id, title, visible) values(${user_id},\"${title}\",${visible})`;
    connection.query(query, function(error, results, fields) {
      if(error) {
        console.log(error);
        res.json('query error');
      }
      else {
        console.log(results);
        res.json({
            'status': true,
            'body': 'insert success'
        });
      }
    })
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from playlist where id=${id}`;
    connection.query(query, function(error, results, fields) {
      if(error) {
        console.log(error);
        res.json('query error');
      }
      else {
        console.log(results);
        res.json({
            'status': true,
            'body': 'delete success'
        });
      }
    });
  });

  return router;
};