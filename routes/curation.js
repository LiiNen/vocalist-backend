
/**
 * /curation
 * [POST] title, content, ctype_id, music_id_list => create curation
 * [DELETE] id : delete curation
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.post('/', (req, res) => {
    var title = req.body.title;
    var content = req.body.content;
    var ctype_id = req.body.ctype_id;
    var music_id_list = req.body.music_id_list;

    try{
      if(title && content && ctype_id) {
        var query = `insert into curation(title, content, ctype_id)\
                    values(\"${title}\", \"${content}\", ${ctype_id});`;
        connection.query(query, function(error, results, fields) {
          if(error) {
            console.log(error);
            res.json('query error');
          }
          else {
            for(var i = 0; music_id_list[i]; i++) {
              var query_insert = `insert into curation_item(curation_id, music_id)\
                                  values(${results.insertId}, ${music_id_list[i]});`;
              connection.query(query_insert, function(error, results, fields) {
                if(error) {
                  res.json('query error');
                }
              });
            }
          }
        });
      }
      else res.json({
        'status': false,
        'log': 'wrong request body name'
      });
    } catch(e) {
      console.log(e);
      res.json({
        'status': false,
        'log': 'try catch error'
      });
    }
    
    if(!res.headersSent) {
      res.json({
        'status': true,
        'log': 'successfully insert curation data'
      });
    }
  });

  router.delete('/', (req, res) => {
    var id = req.body.id;
    var query = `delete from curation where id=${id}`;
    connection.query(query, function(error, results, fields) {
      if(error) {
        res.json('query error');
      }
      else {
        res.json({
            'status': true
        });
      }
    });
  });

  return router;
}