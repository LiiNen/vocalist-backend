
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
    var isLIVE = req.body.isLIVE;

    var getQuery = `select 1 from music where number=${number}`;
    var patchQuery;
    var postQuery;
    if(chart == -1) {
      patchQuery = `update music set title=\"${title}\", artist=\"${artist}\", isMR=${isMR}, isMV=${isMV}, isLIVE=${isLIVE} where number=${number}`;
      postQuery = `insert into music(title, artist, number, isMR, isMV, isLIVE)
                  values(\"${title}\", \"${artist}\", ${number}, ${isMR}, ${isMV}, ${isLIVE})`;
    }
    else {
      patchQuery = `update music set chart=${chart} where number=${number}`;
      postQuery = `insert into music(title, artist, number, chart, isMR, isMV, isLIVE)
                  values(\"${title}\", \"${artist}\", ${number}, ${chart}, ${isMR}, ${isMV}, ${isLIVE})`;
    }
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

  router.get('/music/artist', (req, res) => {
    getConnection(function(connection) {
      var query = `select distinct artist from music`;
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
