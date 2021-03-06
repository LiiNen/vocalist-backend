
/**
 * /curation/item
 * [GET] (/:type?) curation_id => get music(brief(when type == part)) list in curation
 * [POST] curation_id, music_id => add one music to curation
 * [DELETE] curation_id, music_id => delete one music in curation
 * 
 * /curation/item/list
 * [POST] curation_id, music_id_list => add musics to curation
 * [DELETE] curation_id, music_id_list => delete musics to curation
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  var getObject = require('../object');

  router.get('/:type?', (req, res) => {
    var type = req.params.type;
    var object = '*';
    if(type == 'part') object = getObject('list');

    var curation_id = req.query.curation_id;
    var user_id = req.query.user_id;

    var query;
    var params;
    if(user_id == undefined) {
      query = `select ${object} from music
              where music.id in (select music_id from curation_item where curation_id = ?);`;
      params = [curation_id];
    }
    else {
      query = `select distinct ${object},
                case when exists(select id from love where user_id=? and music_id=music.id)
                then 1 else 0
                end as islike
              from music
              where music.id in (select music_id from curation_item where curation_id = ?);`;
      params = [user_id, curation_id];
    }
    
    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
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
              'log': `no music in curation id ${id}`
            });
          }
          else {
            res.json({
              'status': true,
              'body': results
            });
          }
        }
      });
      connection.release();
    });
  });

  router.post('/', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id = req.body.music_id;
    var query = `insert into curation_item(curation_id, music_id) values(?, ?)`;
    var params = [curation_id, music_id];

    getConnection(function(connection) {
      connection.query(query, params, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json({
              'status': false,
              'log': 'query error'
            });
        }
        else {
          console.log(results);
          res.json({
            'status': true,
            'body': 'insert success'
          });
        }
      });
      connection.release();
    });
  });

  router.post('/number', (req, res) => {
    var curation_id = req.body.curation_id;
    var number = req.body.number;
    var check_query = `select id from music where number=?`;
    var check_params = [number];
    var insert_query = `insert into curation_item(curation_id, music_id) values(?, (select id from music where number=?))`;
    var insert_params = [curation_id, number];

    getConnection(function(connection) {
      connection.query(check_query, check_params, function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'check query error'
          });
        }
        else {
          if(results.length == 0) {
            res.json({
              'status': false,
              'log': 'no music'
            });
          }
          else {
            connection.query(insert_query, insert_params, function(error, results, fields) {
              if(error) {
                res.json({
                  'status': false,
                  'log': 'insert query error'
                });
              }
              else {
                res.json({
                  'status': true,
                  'log': 'insert success'
                });
              }
            });
          }
        }
      });
      connection.release();
    });
  });

  router.post('/list', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id_list = req.body.music_id_list;
    var count = 0;
    if(music_id_list.length == 0) {
      res.json({
        'status': false,
        'log': 'no items in music_id_list'
      });
    }
    for(var i = 0; i < music_id_list.length; i++) {
      var query = `insert into curation_item(curation_id, music_id) values(?, ?)`;
      var params = [curation_id, music_id_list[i]];
      count += 1;

      getConnection(function(connection) {
        connection.query(query, params, function(error, results, fields) {
          if(error && !res.headersSent) {
            res.json({
              'status': false,
              'log': 'music_id_list type error'
            });
          }
          else if(!res.headersSent && count == music_id_list.length) {
            res.json({
              'status': true,
              'log': 'curation items insertion success'
            });
          }
        });
        connection.release();
      });

    }
  });

  router.delete('/list', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id_list = req.body.music_id_list;
    var count = 0;
    if(music_id_list.length == 0) {
      res.json({
        'status': false,
        'log': 'no items in music_id_list'
      });
    }
    for(var i = 0; i < music_id_list.length; i++) {
      let query = `delete from curation_item where music_id = ?`;
      let params = [music_id_list[i]];
      count += 1;

      getConnection(function(connection) {
        connection.query(query, params, function(error, results, fields) {
          if(error && !res.headersSent) {
            res.json({
              'status': false,
              'log': 'music_id_list type error'
            });
            for(var j = 0; j < i; j++) {
              let restore_params = [curation_id, music_id_list[j]];
              connection.query(`insert into curation_item(curation_id, music_id) values(?, ?)`, restore_params);
            }
          }
          else if(!res.headersSent && count == music_id_list.length) {
            res.json({
              'status': true,
              'log': 'curation items deletion success'
            });
          }
        });
        connection.release();
      });

    }
  });

  router.patch('/list', (req, res) => {
    var curation_id = req.body.curation_id;
    var insert_list = req.body.insert_list;
    var delete_list = req.body.delete_list;
    var insertCount = 0;
    var deleteCount = 0;
    if(insert_list.length == 0 && delete_list.length == 0) {
      res.json({
        'status': false,
        'log': 'no items in both insert and delete list'
      });
    }
    for(var i = 0; i < insert_list.length; i++) {
      let insertQuery = `insert into curation_item(curation_id, music_id) values(?, ?)`;
      let insertParams = [curation_id, insert_list[i]];
      insertCount += 1;

      getConnection(function(connection) {
        connection.query(insertQuery, insertParams, function(error, results, fields) {
          if(error && !res.headersSent) {
            res.json({
              'status': false,
              'log': 'insert list type error'
            });
          }
          else if(!res.headersSent && insertCount == insert_list.length && deleteCount == delete_list.length) {
            res.json({
              'status': true,
              'log': 'curation items change success'
            });
          }
        });
        connection.release();
      });

    }
    for(var j = 0; j < delete_list.length; j++) {
      let deleteQuery = `delete from curation_item where curation_id=? and music_id=?`;
      let deleteParams = [curation_id, delete_list[j]];
      deleteCount += 1;

      getConnection(function(connection) {
        connection.query(deleteQuery, deleteParams, function(error, results, fields) {
          if(error && !res.headersSent) {
            res.json({
              'status': false,
              'log': 'delete list type error'
            });
          }
          else if(!res.headersSent && insertCount == insert_list.length && deleteCount == delete_list.length) {
            res.json({
              'status': true,
              'log': 'curation items change success'
            });
          }
        });
        connection.release();
      });
    }
  });

  return router;
}