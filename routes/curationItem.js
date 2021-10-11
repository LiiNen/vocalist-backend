
/**
 * /curation/item
 * [GET] curation_id => get music(brief) list in curation
 * [POST] curation_id, music_id => add one music to curation
 * [DELETE] curation_id, music_id => delete one music in curation
 */

module.exports = (connection) => {
  var router = require('express').Router();

  router.get('/:type?', (req, res) => {
    var type = req.params.type;
    var target = '*';
    if(type == 'part') target = 'music.id, music.title, music.artist';

    var curation_id = req.query.curation_id;
    var query = `select ${target} from music\
                where music.id in (select music_id from curation_item where curation_id = ${curation_id});`;
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
  });

  router.post('/', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id = req.body.music_id;
    var query = `insert into curation_item(curation_id, music_id) values(${curation_id}, ${music_id})`;
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
  });

  router.delete('/', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id = req.body.music_id;
    var query = `delete from curation_item where curation_id=${curation_id} and music_id=${music_id}`;
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
  });

  return router;
}