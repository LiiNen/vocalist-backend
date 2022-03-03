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
                    case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where number is not null and youtube is not null`;
      if(id != 0) query = `${query} and id=${id}`;

      getConnection(function(connection) {
        connection.query(query, function(error, results, fields) {
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

  router.get('/list', (req, res) => {
    var user_id = req.query.user_id;
    var page = req.query.page;
    var per_page = req.query.per_page;
    
    var object = getObject('list');

    if(user_id && page && per_page) {
      var query = `select distinct ${object},
                    case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                    then 1 else 0
                    end as islike
                  from music where youtube is not null and number is not null`;
      
      getConnection(function(connection) {
        var queryAsync = Promise.promisify(connection.query.bind(connection));
        process.stdin.resume()
        process.on('exit', exitHandler.bind(null, { shutdownDb: true } ));

        var numRow;
        var numPage;
        queryAsync('select count(*) as numRow from music').then(function(results) {
          numRow = results[0].numRow;
          numPage = Math.ceil(numRow / per_page);
          console.log(numPage);
        }).then(
          () => queryAsync(`${query} limit ${page * per_page}, ${per_page}`)
        ).then(function(results) {
          var responsePayload = {body: results};
          if(page < numPage) {
            responsePayload.pagination = {
              current: page,
              per_page: per_page,
              previous: page > 0 ? page - 1 : undefined,
              next: page < numPage - 1 ? page + 1 : undefined
            }
          }
          else responsePayload.pagination = {
            err: 'queried page ' + page + ' is >= to maximum page number ' + numPage
          }
          responsePayload.status = true;
          res.json(responsePayload);
        })
        .catch(function(error) {
          res.json({
            'status': false,
            'log': 'catch error'
          });
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
                  case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                  then 1 else 0
                  end as islike
                from music
                where music.chart is not null
                order by music.chart`;
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

  router.get('/rec', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select id, title, artist, number from music where number is not null and youtube is not null order by rand() limit 30`;

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

  router.get('/rec/artist', (req, res) => {
    var user_id = req.query.user_id;
    var artist = req.query.artist;
    var contain = req.query.contain; // should be 0 or 1
    var object = getObject('list');

    var query = `select ${object},
                  case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                  then 1 else 0
                  end as islike
                from music where number is not null and youtube is not null and artist `;
    if(contain == 0) query = query + `='${artist}'`;
    else if(contain == 1) query = query + `like '%${artist}%' and artist != '${artist}'`;
    else {
      res.json({
        'status': false,
        'body': 'query error'
      });
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

  router.get('/rec/love', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select distinct artist 
                from music where music.id in 
                (select music_id from love
                where user_id=${user_id} and music_id=music.id);`;

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

  function exitHandler(options, err) {
    if (options.shutdownDb) {
      console.log('shutdown mysql connection');
      connection.end();
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
  }

  return router;
}

