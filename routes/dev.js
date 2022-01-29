
module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.patch('/music/number', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var number = req.body.number;

    var query = `update music set number = ${number} where itunes_id=${itunes_id}`;
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

  router.patch('/music/cluster', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var cluster = req.body.cluster;
    
    var query = `update music set cluster = ${cluster} where itunes_id=${itunes_id}`;
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

  router.patch('/music/frequency', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var frequency = req.body.frequency;
    
    var query = `update music set frequency=${frequency} where itunes_id=${itunes_id}`;
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

  router.get('/music/youtube', (req, res) => {
    var query = `select id, title, artist from music where youtube is null`;

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

  router.patch('/music/youtube', (req, res) => {
    var code=req.body.code;
    var id=req.body.id;
    var query = `update music set youtube=\'${code}\' where id=${id}`;

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

  router.patch('/music/chart', (req, res) => {
    var query = `update music set chart=NULL`;

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
            'body': 'success initializing'
          });
        }
      });
      connection.release();
    })
  });

  router.post('/music/chart', (req, res) => {
    var title = req.body.title;
    var artist = req.body.artist;
    var number = req.body.number;
    var chart = req.body.chart;
    var isMR = req.body.isMR;
    var isMV = req.body.isMV;

    var getQuery = `select 1 from music where number=${number}`;
    var patchQuery = `update music set chart=${chart} where number=${number}`;
    var postQuery;
    if(chart == -1) postQuery = `insert into music(itunes_id, title, artist, number, isMR, isMV)
                                values(-1, \"${title}\", \"${artist}\", ${number}, ${isMR}, ${isMV})`;
    else postQuery = `insert into music(itunes_id, title, artist, number, chart, isMR, isMV)
                      values(-1, \"${title}\", \"${artist}\", ${number}, ${chart}, ${isMR}, ${isMV})`;
    getConnection(function(connection) {
      connection.query(getQuery, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
            'status': false,
            'log': 'query error',
          });
        }
        else {
          if(results.length != 0 && chart != -1) {
            getConnection(function(patchConnection) {
              patchConnection.query(patchQuery, function(error, results, fields) {
                if(error) {
                  res.json({
                    'status': false,
                    'log': 'patch error'
                  });
                }
                else {
                  res.json({
                    'status': true,
                    'body': 'patch'
                  });
                }
              });
              patchConnection.release();
            });
          }
          else {
            getConnection(function(postConnection) {
              postConnection.query(postQuery, function(error, results, fields) {
                if(error) {
                  console.log(error)
                  res.json({
                    'status': false,
                    'log': 'post error'
                  });
                }
                else {
                  res.json({
                    'status': true,
                    'body': 'post'
                  });
                }
              });
              postConnection.release();
            });
          }
        }
      });
      connection.release();
    });
  });

  router.get('/demo', (req, res) => {
    var id = req.query.id;
    
    getConnection(function(connection) {
      var query = `select count(music_id) as count, id, title, content, ctype_id
                  from curation, curation_item
                  where curation_item.curation_id=curation.id and demo_type is not null
                  `;
      if(id != 0) query = `${query} and id=${id}`;
      query = `${query} group by id;`;
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

  return router;
}
