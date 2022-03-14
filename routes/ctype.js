
/**
 * /ctype
 * [GET] id => search ctype with id, 0 for search all
 * [POST] title => create ctype
 * [DELETE] id => delete ctype with id in ctype
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var id = req.query.id;

    getConnection(function(connection) {
      if(id) {
        var query = `select * from ctype`;
        if(id != 0) query = `${query} where id=?;`;
	      else query = `${query} where is_open=1`;

        connection.query(query, [id], function(error, results, fields) {
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
                'body': `no ctype with id ${id}`
              });
            }
            else res.json({
              'status': true,
              'body': id==0 ? results : results[0]
            });
          }
        })
      }
      else {
        res.json({
          'status': false,
          'log': 'query error'
        });
      }
      connection.release();
    });
  });
  
  router.post('/', (req, res) => {
    var title = req.body.title;
    var query = `insert into ctype(title) values(?);`;

    getConnection(function(connection) {
      connection.query(query, [title], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'query error'
          });
        }
        else {
          res.json({
            'status': true,
            'body': 'ctype add success'
          });
        }
      });
      connection.release();
    });
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from ctype where id=?`;

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
            'body': 'ctype delete success'
          });
        }
      });
      connection.release();
    });
  });

  return router;
}
