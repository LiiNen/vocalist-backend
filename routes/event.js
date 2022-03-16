const { json } = require('body-parser');

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/', (req, res) => {
    var query = `select img_url, img_banner_url,
                (select distinct count(1) from event where id > 1) as count
                from event where id = 1`;
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

  router.get('/user', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select participate, ad_participate from event where user_id=? and id > 1`;

    getConnection(function(connection) {
      connection.query(query, [user_id], function(error, results, fields) {
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
              'body': {"phone": '0', "participate": 0,"ad_participate": 0}
            });
          }
          else {
            res.json({
              'status': true,
              'body': results[0]
            })
          }
        }
      });
      connection.release();
    });
  });

  router.post('/user', (req, res) => {
    var user_id = req.query.user_id;
    var query = `insert into
                event(user_id, participate, ad_participate, phone)
                values(?, 1, 0, ?)`;
    var params = [user_id, phone];
    
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
            'body': 'event participate success!'
          });
        }
      });
      connection.release();
    });
  });

  return router;
}