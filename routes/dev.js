
module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

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
    var query = `update music set youtube=\'?\' where id=?`;
    var params = [code, id];

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

  router.delete('/music/youtube', (req, res) => {
    var query = 'delete from music where youtube is null';

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
            'body': 'success'
          });
        }
      });
      connection.release();
    });
  })

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
    var isLIVE = req.body.isLIVE;

    var getQuery = `select 1 from music where number=?`;
    var getParams = [number];
    var patchQuery;
    var patchParams;
    var postQuery;
    var postParams;
    if(chart == -1) {
      patchQuery = `update music set title=\"?\", artist=\"?\", isMR=?, isMV=?, isLIVE=? where number=?`;
      patchParams = [title, artist, isMR, isMV, isLIVE, number];

      postQuery = `insert into music(title, artist, number, isMR, isMV, isLIVE)
                  values(\"?\", \"?\", ?, ?, ?, ?)`;
      postParams = [title, artist, number, isMR, isMV, isLIVE];
    }
    else {
      patchQuery = `update music set chart=? where number=?`;
      patchParams = [chart, number];

      postQuery = `insert into music(title, artist, number, chart, isMR, isMV, isLIVE)
                  values(\"?\", \"?\", ?, ?, ?, ?)`;
      postParams = [title, artist, number, isMR, isMV, isLIVE];
    }
    
    getConnection(function(connection) {
      connection.query(getQuery, getParams, function(error, results, fields) {
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
              patchConnection.query(patchQuery, patchParams, function(error, results, fields) {
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
              postConnection.query(postQuery, postParams, function(error, results, fields) {
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

  router.delete('/music/clean', (req, res) => {
    getConnection(function(connection) {
      var query = `delete from music w here id in (
        select * from (
          select b.id from music b
            where b.id > (select min(c.id) from music c where b.number = c.number)
        ) as result
      )`;
      connection.query(query, function(error, results, fields) {
        connection.release();
      });
    })
  });

  router.get('/demo', (req, res) => {
    var id = req.query.id;
    var query = `select count(music_id) as count, id, title, content, ctype_id
                from curation, curation_item
                where curation_item.curation_id=curation.id and demo_type is not null`;
    if(id != 0) query = `${query} and id=?`;
    query = `${query} group by id;`;

    getConnection(function(connection) {
      connection.query(query, [id], function(error, results, fields) {
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

  router.get('/music/artist', (req, res) => {
    var all = req.query.all;
    var query;
    if(all==1) {
      query = `select distinct aritst from music`;
    }
    else if(all==0) {
      query = `select artist, count(1) as a_count from music group by artist having a_count=1`;
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

  router.patch('/music/artist', (req, res) => {
    getConnection(function(connection) {
      var query = `update music set artist = SUBSTRING_INDEX(artist, '\n', -1) where artist like '%\n%'`;
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
            'body': 'removing \\n success'
          });
        }
      });
    });
  });

  return router;
}
