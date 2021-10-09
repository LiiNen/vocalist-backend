
/**
 * /login
 * [GET] email, type => signin check
 * [POST] email, name, type => signup action
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.get('/', (req, res) => {
    var email = req.query.email;
    var type = req.query.type;
    if(email && type) {
      var query = `select * from user where email=\"${email}\"and type=\"${type}\";`;
      connection.query(query, function(error, results, fields) {
        if(error) {
          res.json('query error');
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
      var query = `insert into user(email, name, type) values(\"${email}\", \"${name}\", \"${type}\");`
      connection.query(query, function(error, results, fields) {
        if(error) {
          res.json('query error');
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
    }
    else res.json({
      'status': false,
      'log': 'wrong request body name'
    });
  });

  return router;
}