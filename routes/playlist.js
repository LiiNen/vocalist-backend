/**
 * /playlist
 * [GET] user_id => get playlist of userid
 * [POST] user_id, title, visible => create playlist with userid
 * [DELETE] id => delete playlist of id(playlist)
 * 
 * /playlist/curation
 * [POST] user_id, curation_id => curation data to user's playlist (include _item curation -> playlist)
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select id, title from playlist where user_id=${user_id}`;

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
    var title = req.body.title;
    var visible = req.body.visible;
    var query = `insert into playlist(user_id, title, visible) values(${user_id},\"${title}\",${visible})`;

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
              'body': 'insert success'
          });
        }
      });
      connection.release();
    });
    
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var queryPlaylist = `delete from playlist where id=${id}`;
    var queryPlaylistItem = `delete from playlist_item where playlist_id=${id}`;

    getConnection(function(connection) {
      connection.query(queryPlaylistItem, function(error, results, fields) {
        if(error) {
          res.json('query playlistItem error');
        }
        else {
          connection.query(queryPlaylist, function(error, results, fields) {
            if(error) {
              res.json('query playlist error');
            }
            else {
              res.json({
                'status': true
              });
            }
          });
        }
      });
      connection.release();
    });
    
  });

  router.post('/curation', (req, res) => {
    var user_id = req.body.user_id;
    var curation_id = req.body.curation_id;

    var query = `insert into playlist(user_id, title) select ${user_id}, title from curation where id=${curation_id};`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json('error');
        }
        else {
          var query_item = `insert into playlist_item(playlist_id, music_id) select ${results.insertId}, music_id from curation_item where curation_id=${curation_id};`;
          connection.query(query_item, function(error, results, fields) {
            if(error) {
              console.log(error);
              res.json('error in item');
            }
            else {
              res.json({
                'status': true,
                'body': 'insert success'
              });
            }
          });
        }
      });
      connection.release();
    });
    
  });

  return router;
};