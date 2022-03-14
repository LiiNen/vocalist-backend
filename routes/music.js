module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  var getObject = require('../object');
  var Promise = require('bluebird');
  
  router.get('/', (req, res) => {
    var id = req.query.id;
    var user_id = req.query.user_id;

    if(id && user_id) {
      var query = `select distinct *,
                    case when exists(select id from love where user_id=? and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where number is not null and youtube is not null`;
      if(id != 0) query = `${query} and id=?`;
      var params = [user_id, id];

      getConnection(function(connection) {
        connection.query(query, params, function(error, results, fields) {
          if(error) {
            res.json({
              'status': false,
              'log': 'query error'
            });
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

  router.get('/chart', (req, res) => {
    var user_id = req.query.user_id;

    var object = getObject('chart');
    var query = `select distinct ${object},
                  case when exists(select id from love where user_id=? and music_id=music.id)
                  then 1 else 0
                  end as islike
                from music
                where music.chart is not null
                order by music.chart`;
    
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

  router.get('/rec', (req, res) => {
    var user_id = req.query.user_id;
    var object = getObject('list');

    var query = `select ${object},
                  case when exists(select id from love where user_id=? and music_id=music.id)
                  then 1 else 0
                  end as islike
                from music where number is not null and youtube is not null order by rand() limit 30`;

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

  router.get('/rec/artist', (req, res) => {
    var user_id = req.query.user_id;
    var artist = req.query.artist;
    var contain = req.query.contain; // should be 0 or 1
    var object = getObject('list');

    var query = `select ${object},
                  case when exists(select id from love where user_id=? and music_id=music.id)
                  then 1 else 0
                  end as islike
                from music where number is not null and youtube is not null and artist `;
    if(contain == 0) query = query + `=?`;
    else if(contain == 1) query = query + `!= ? and artist like ?`;
    else {
      res.json({
        'status': false,
        'body': 'query error'
      });
    }
    var params = [user_id, artist, `%${artist}%`];

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

  router.get('/rec/love', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select distinct artist 
                from music where music.id in 
                (select music_id from love
                where user_id=? and music_id=music.id);`;

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

  router.get('/new', (req, res) => {
    var user_id = req.query.user_id;
    var object = getObject('list');

    var query = `select distinct ${object},
                  case when exists(select id from love where user_id=? and music_id=music.id)
                  then 1 else 0
                end as islike
                from music where number is not null and youtube is not null order by music.id desc limit 30`;

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

  return router;
}

