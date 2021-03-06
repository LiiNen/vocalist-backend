
/**
 * /playlist/item
 * [GET] playlist_id => get music data in list
 * [POST] playlist_id, music_id => insert
 * [DELETE] playlist_id, music_id => delete
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  var getObject = require('../object');

  router.get('/:type?', (req, res) => {
    var type = req.params.type;
    var object = '*';
    if(type == 'part') object = getObject('list');

    var playlist_id = req.query.playlist_id;
    var user_id = req.query.user_id;

    var query;
    var params;
    if(user_id == undefined) {
      query = `select ${object} from music 
                  where music.id in (select music_id from playlist_item where playlist_id=?)`;
      params = [playlist_id];
    }
    else {
      query = `select distinct ${object},
                case when exists(select id from love where user_id=? and music_id=music.id)
                then 1 else 0
                end as islike
              from music
              where music.id in (select music_id from playlist_item where playlist_id = ?);`;
      params = [user_id, playlist_id];
    }

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
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `insert into playlist_item(playlist_id, music_id)
                select ?, ? from dual
                where not exists
                (select * from playlist_item where playlist_id=? and music_id=?)`;
    var params = [playlist_id, music_id, playlist_id, music_id];
    
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
            'body': 'insert success'
          });
        }
      });
      connection.release();
    });
    
  });

  router.delete('/', (req, res) => {
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `delete from playlist_item where playlist_id=? and music_id=?`;
    var params = [playlist_id, music_id];

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
            'body': 'delete success'
          });
        }
      });
      connection.release();
    });
    
  });

  return router;
}