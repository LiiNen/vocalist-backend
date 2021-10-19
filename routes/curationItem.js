
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

  router.get('/:type?', (req, res) => {
    var type = req.params.type;
    var target = '*';
    if(type == 'part') target = 'music.id, music.title, music.artist';

    var curation_id = req.query.curation_id;
    var user_id = req.query.user_id;

    var query;
    if(user_id == undefined) {
      query = `select ${target} from music\
              where music.id in (select music_id from curation_item where curation_id = ${curation_id});`;
    }
    else {
      query = `select distinct ${target},
                case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                then 1 else 0
                end as islike
              from music\
              where music.id in (select music_id from curation_item where curation_id = ${curation_id});`;
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
    var query = `insert into curation_item(curation_id, music_id) values(${curation_id}, ${music_id})`;
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
      var query = `insert into curation_item(curation_id, music_id) values(${curation_id}, ${music_id_list[i]})`;
      count += 1;

      getConnection(function(connection) {
        connection.query(query, function(error, results, fields) {
          if(error && !res.headersSent) {
            res.json({
              'status': false,
              'log': 'music_id_list type error'
            });
            for(var j = 0; j < i; j++) {
              connection.query(`delete from curation_item where curation_id=${curation_id} and music_id=${music_id_list[j]};`);
            }
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
      var query = `delete from curation_item where music_id = ${music_id_list[i]}`;
      count += 1;

      getConnection(function(connection) {
        connection.query(query, function(error, results, fields) {
          if(error && !res.headersSent) {
            res.json({
              'status': false,
              'log': 'music_id_list type error'
            });
            for(var j = 0; j < i; j++) {
              connection.query(`insert into curation_item(curation_id, music_id) values(${curation_id}, ${music_id_list[j]})`);
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
      console.log(insert_list, insert_list[i]);
      let insertQuery = `insert into curation_item(curation_id, music_id) values(${curation_id}, ${insert_list[i]})`;
      insertCount += 1;

      getConnection(function(connection) {
        connection.query(insertQuery, function(error, results, fields) {
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
      let deleteQuery = `delete from curation_item where curation_id=${curation_id} and music_id=${delete_list[j]}`;
      deleteCount += 1;

      getConnection(function(connection) {
        connection.query(deleteQuery, function(error, results, fields) {
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