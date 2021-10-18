
/**
 * /playlist/item
 * [GET] playlist_id => get music data in list
 * [POST] playlist_id, music_id => insert
 * [DELETE] playlist_id, music_id => delete
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/:type?', (req, res) => {
    var type = req.params.type;
    var target = '*';
    if(type == 'part') target = 'music.id, music.title, music.artist';

    var playlist_id = req.query.playlist_id;
    var user_id = req.query.user_id;

    var query;
    if(user_id == undefined) {
      query = `select ${target} from music \
                  where music.id in (select music_id from playlist_item where playlist_id=${playlist_id})`;
    }
    else {
      query = `select distinct ${target},
                case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                then 1 else 0
                end as islike
              from music\
              where music.id in (select music_id from playlist_item where playlist_id = ${playlist_id});`;
    }

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
    
  });

  router.post('/', (req, res) => {
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `insert into playlist_item(playlist_id, music_id) values(${playlist_id}, ${music_id})`;
    
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
    var query = `delete from playlist_item where playlist_id=${playlist_id} and music_id=${music_id}`;

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
            'body': 'delete success'
          });
        }
      });
      connection.release();
    });
    
  });

  return router;
}