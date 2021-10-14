 /**
 * /music
 * [GET] id, user_id => get music with user like, id 0 for get all music
 * [POST] itunes_id, title, artist, genre, time, year => insert music if not in database(check itunes_id)
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  
  router.get('/:type?', (req, res) => {
    var id = req.query.id;
    var user_id = req.query.user_id;
    
    var type = req.params.type;
    var target = '*';
    if(type == 'part') target = 'music.id, music.title, music.artist';

    if(id && user_id) {
      var query = `select distinct ${target},
                    case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music`;
      if(id != 0) query = `${query} where id=${id};`;
      
      getConnection(function(connection) {
        connection.query(query, function(error, results, fields) {
          if(error) {
            res.json('query error');
          }
          else {
            if(results.length == 0) {
              res.json({
                'status': false,
                'log': `no music with id ${id}`
              });
            }
            else res.json({
              'status': true,
              'body': (id == 0) ? results : results[0]
            });
          }
        });
        connection.release();
      });
      
    }
    else res.json({
      'status': false,
      'log': 'wrong request param error'
    });
  });

  router.post('/', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var title = req.body.title;
    var artist = req.body.artist;
    var genre = req.body.genre;
    var time = req.body.time;
    var year = req.body.year;

    if(itunes_id && title && artist && genre && time && year) {
      var select_query = `select id from music where itunes_id=${itunes_id};`;

      getConnection(function(connection) {
        connection.query(select_query, function(error, results, fields) {
          if(error) {
            res.json('query error');
          }
          else {
            if(results.length == 0) {
              var query = `insert into music(itunes_id, title, artist, genre, time, year)\
                          values(${itunes_id}, \"${title}\", \"${artist}\", \"${genre}\", ${time}, ${year});`;
              connection.query(query, function(error, results, fields) {
                if(error) {
                  res.json('query error');
                }
                else {
                  console.log(results.insertId);
                  res.json({
                    'status': true
                  });
                }
              });
            }
            else {
              res.json({
                'status': false,
                'log': 'already exists itunes_id'
              });
            }
          }
        });
        connection.release();
      });
      
    }
    else res.json({
      'status': false,
      'log': 'wrong request body name'
    });
  });

  return router;
}

