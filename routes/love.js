
/**
 * /love
 * @Column
 * music_id, user_id
 * if pair exists, then the user likes the music
 * 
 * [POST] music_id, user_id => like music
 * [DELETE] music_id, user_id => dislike music
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.post('/', (req, res) => {
    var music_id = req.body.music_id;
    var user_id = req.body.user_id;
    var query = `insert into love(music_id, user_id) values(${music_id}, ${user_id})`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'like'
          })
        }
      });
      connection.release();
    });
    
  });
  
  router.delete('/', (req, res) => {
    var music_id = req.body.music_id;
    var user_id = req.body.user_id;
    var query = `delete from love where music_id=${music_id} and user_id=${user_id}`;
    
    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          console.log(results);
          res.json({
            'status': true,
            'body': 'unlike'
          });
        }
      });
      connection.release();
    });
    
  });

  router.get('/count', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select count(*) as count from love where user_id=${user_id}`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
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

  router.get('/list', (req, res) => {
    var user_id = req.query.user_id;
    var target = 'music.id, music.title, music.artist, 1 as islike, love.pitch';
    var query = `select ${target} from music, love where music.id = love.music_id and love.user_id = ${user_id}`;

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

  router.patch('/list/pitch', (req, res) => {
    var user_id = req.query.user_id;
    var music_id = req.query.music_id;
    var pitch = req.query.pitch;
    var query = `update love set pitch = ${pitch} where user_id=${user_id} and music_id=${music_id};`;

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
            'body': 'set pitch success'
          });
        }
      });
      connection.release();
    });
  });
  
  return router;
}