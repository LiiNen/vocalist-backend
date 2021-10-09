
/**
 * /ctype
 * [GET] id => search ctype with id, 0 for search all
 * [POST] title => create ctype
 * [DELETE] id => delete ctype with id in ctype
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.get('/', (req, res) => {
    var id = req.query.id;
    if(id) {
      var query = `select * from ctype`;
      if(id != 0) query = `${query} where id=${id};`;
      connection.query(query, function(error, results, fields) {
        if(error) {
          res.json('query error');
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
      res.json('query error');
    }
  });
  
  router.post('/', (req, res) => {
    var title = req.body.title;
    var query = `insert into ctype(title) values(\"${title}\");`;
    connection.query(query, function(error, results, fields) {
      if(error) {
        res.json('query error');
      }
      else {
        res.json({
          'status': true,
        });
      }
    });
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from ctype where id=${id}`;
    connection.query(query, function(error, results, fields) {
      if(error) {
        res.json('query error');
      }
      else {
        res.json({
          'status': true,
        });
      }
    });
  });

  return router;
}