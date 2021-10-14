
/**
 * /curation/item
 * [GET] curation_id => get music(brief) list in curation
 * [POST] curation_id, music_id => add one music to curation
 * [DELETE] curation_id, music_id => delete one music in curation
 * 
 * /curation/item/list
 * [POST] curation_id, music_id_list => add musics to curation
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');

  router.get('/:type?', (req, res) => {
    var type = req.params.type;
    var target = '*';
    if(type == 'part') target = 'music.id, music.title, music.artist';

    var curation_id = req.query.curation_id;
    var query = `select ${target} from music\
                where music.id in (select music_id from curation_item where curation_id = ${curation_id});`;
    
    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          res.json('query error');
        }
        else {
          if(results.length == 0) {
            res.json({
              'status': false,
              'log': `no music in curation id ${id}`
            })
          }
          else {
            res.json({
              'status': true,
              'body': results
            })
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
          res.json('query error');
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
        'status': true,
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
              'log': 'curation insertion success'
            });
          }
        });
        connection.release();
      });

    }
  });

  router.delete('/', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id = req.body.music_id;
    var query = `delete from curation_item where curation_id=${curation_id} and music_id=${music_id}`;

    getConnection(function(connection) {
      connection.query(query, function(error, results, fields) {
        if(error) {
          console.log(error);
          res.json('query error');
        }
        else {
          console.log(results);
          res.json({
            'status': true,
            'body': 'delete success'
          });
        }
      });
      connection.release();
    });
  });

  return router;
}