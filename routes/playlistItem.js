
/**
 * /playlist/item
 * [GET] playlist_id => get music data in list
 * [POST] playlist_id, music_id => insert
 * [DELETE] playlist_id, music_id => delete
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.get('/', (req, res) => {
    var playlist_id = req.query.playlist_id;
    var query = `select * from music where music.id in (select music_id from playlist_item as pi where pi.playlist_id=${playlist_id})`;
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
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `insert into playlist_item(playlist_id, music_id) values(${playlist_id}, ${music_id})`;
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
  });

  router.delete('/', (req, res) => {
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `delete from playlist_item where playlist_id=${playlist_id} and music_id=${music_id}`;
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
}