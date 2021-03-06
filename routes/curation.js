
/**
 * /curation
 * [GET] id => get curation data, id=0 for search all
 * [POST] title, content, ctype_id, music_id_list => create curation
 * [DELETE] id : delete curation
 */

module.exports = () => {
  var router = require('express').Router();
  var getConnection = require('../connection');
  var getObject = require('../object');

  router.get('/', (req, res) => {
    var id = req.query.id;
    var object = getObject('curation');
    
    getConnection(function(connection) {
      var query = `select ${object}
                  from curation, curation_item
                  where curation_item.curation_id=curation.id and demo_type is null
                  `;
      if(id != 0) query = `${query} and id=?`;
      query = `${query} group by id;`;
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

  router.get('/ctype', (req, res) => {
    var ctype_id = req.query.ctype_id;
    var object = getObject('curation');
    var query = `select ${object}
                from curation, curation_item
                where curation_item.curation_id=curation.id and ctype_id=? and (demo_type is null or demo_type=0)
                group by id`;
    
    getConnection(function(connection) {
      connection.query(query, [ctype_id], function(error, results, fields) {
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

  router.post('/', (req, res) =>  {
    var title = req.body.title;
    var content = req.body.content;
    var ctype_id = req.body.ctype_id;
    var music_id_list = req.body.music_id_list;
    var params = [title, content, ctype_id];

    try{
      if(title && content && ctype_id) {
        var query = `insert into curation(title, content, ctype_id)
                    values(?, ?, ?);`;

        getConnection(function(connection) {
          connection.query(query, params, function(error, results, fields) {
            if(error) {
              res.json({
                'status': false,
                'log': 'query error'
              });
            }
            else {
              if(music_id_list.length == 0) {
                res.json({
                  'status': true,
                  'log': results.insertId
                });
              }
              else {
                var count = 0;
                for(var i = 0; i < music_id_list.length; i++) {
                  var curation_id = results.insertId;
                  var query_item = `insert into curation_item(curation_id, music_id)
                                      values(${results.insertId}, ?);`;
                  var params_item = [music_id_list[i]];

                  connection.query(query_item, params_item, function(error, results, fields) {
                    count+=1;
                    if(error && !res.headersSent) {
                      res.json({
                        'status': false,
                        'log': 'query error'
                      });
                      connection.query(`delete from curation where id=${curation_id};`);
                      connection.query(`delete from curation_item where curation_id=${curation_id};`);
                    }
                    else if(!res.headersSent && count == music_id_list.length) {
                      res.json({
                        'status': true,
                        'log': 'curation insertion success'
                      });
                    }
                  });
                }
              }
            }
          });
          connection.release();
        });
      }
      else res.json({
        'status': false,
        'log': 'wrong request body name'
      });
    } catch(e) {
      res.json({
        'status': false,
        'log': 'try catch error'
      });
    }
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var queryCuration = `delete from curation where id=?`;
    var queryCurationItem = `delete from curation_item where curation_id=?`;

    getConnection(function(connection) {
      connection.query(queryCurationItem, [id], function(error, results, fields) {
        if(error) {
          res.json({
            'status': false,
            'log': 'try catch error'
          });
        }
        else {
          connection.query(queryCuration, [id], function(error, results, fields) {
            if(error) {
              res.json({
                'status': false,
                'log': 'try catch error'
              });
            }
            else {
              res.json({
                'status': true,
                'body': 'delete success'
              });
            }
          });
        }
      });
      connection.release();
    });
    
  });

  return router;
}
