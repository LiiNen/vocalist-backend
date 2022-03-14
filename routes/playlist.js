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
  var getObject = require('../object');

  router.get('/', (req, res) => {
    var user_id = req.query.user_id;
    var object = getObject('playlist');
    var query = `select ${object}
                from playlist
                left join playlist_item on playlist.id=playlist_item.playlist_id
                where user_id=?
                group by id`;

    getConnection(function(connection) {
      connection.query(query, [user_id], function(error, results, fields) {
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
    var title = req.body.title;
    var visible = req.body.visible;
    var emoji = req.body.emoji;
    var query = `insert into playlist(user_id, title, visible, emoji) values(?, ?, ?, ?)`;
    var params = [user_id, title, visible, emoji];

    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
        if(error) {
          console.log(error)
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'insert success'
          });
        }
      });
      connection.release();
    });
  });

  router.patch('/', (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var emoji = req.body.emoji;
    var query = `update playlist set title=\"?\", emoji=\"?\" where id=?`;
    var params = [title, emoji, id];

    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
        if(error) {
          console.log(error)
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'update title, emoji success'
          });
        }
      });
      connection.release();
    });
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var queryPlaylist = `delete from playlist where id=?`;
    var queryPlaylistItem = `delete from playlist_item where playlist_id=?`;

    getConnection(function(connection) {
      connection.query(queryPlaylistItem, [id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query playlistItem error'
          });
        }
        else {
          connection.query(queryPlaylist, [id], function(error, results, fields) {
            if(error) {
              res.json({
                'status': false,
                'log': 'query playlist error'
              });
            }
            else {
              res.json({
                'status': true,
                'body': 'delete playlist success'
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

    var query = `insert into playlist(user_id, title) select ?, title from curation where id=?;`;
    var params = [user_id, curation_id];

    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          var query_item = `insert into playlist_item(playlist_id, music_id) select ${results.insertId}, music_id from curation_item where curation_id=?;`;
          var params_item = [curation_id];

          connection.query(query_item, params_item, function(error, results, fields) {
            if(error) {
              res.json({
                'status': false,
                'log': 'query error'
              });
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

  router.get('/count', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select count(*) as count from playlist where user_id=?`;

    getConnection(function(connection) {
      connection.query(query, [user_id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': results[0]
          });
        }
      });
      connection.release();
    });

  });

  return router;
};
