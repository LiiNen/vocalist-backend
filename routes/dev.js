
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

  router.patch('/music/interval', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var interval = req.body.interval;
    
    var query = `update music set interval = ${interval} where itunes_id=${itunes_id}`;
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

    var getQuery = `select 1 from music where number=${number}`;
    var patchQuery = `update music set chart=${chart} where number=${number}`;
    var postQuery = `insert into music(itunes_id, title, artist, number, chart)
                    values(-1, \"${title}\", \"${artist}\", ${number}, ${chart})`;
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
          if(results.length != 0) {
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

  return router;
}