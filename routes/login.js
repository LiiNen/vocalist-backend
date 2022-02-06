
/**
 * /login
 * @Column
 * id(pk, int), email(String), name(String), type(String)
 * 
 * type
 * google, apple
 * 
 * [GET] email, type => signup check (results['body']['exist'] for user existence)
 * [POST] email, name, type => signup action
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var email = req.query.email;
    var type = req.query.type;
    if(email && type) {
      var query = `select * from user where email=\"${email}\";`;
      
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
                'status': true,
                'body': {
                  'exist': false,
                  'data': null
                }
              });
            }
            else res.json({
              'status': true,
              'body': {
                'exist': true, 
                'data': results[0]
              }
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
    var email = req.body.email;
    var name = req.body.name;
    var type = req.body.type;
    if(email && name && type) {
      var query = `insert into user(email, name, type)
                  select \"${email}\", \"${name}\", \"${type}\"
                  from dual
                  where not exists(select 1 from user where email=\"${email}\");`

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
              'status': (results.protocol41 == true),
              'body': {
                'id': results.insertId,
                'email': email,
                'name': name,
                'type': type
              }
            });
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