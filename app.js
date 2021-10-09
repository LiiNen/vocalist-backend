/**
 * express setting
 */

var express = require('express');
var cors = require('cors');
var app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({'extended' : true}));
app.use(express.static('public'));
app.use(cors());

/** 
 * mysql setting with dotenv key
 */
require("dotenv").config();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

var query_error = {
    'status': false,
    'log': 'query error'
}

// 처음에 연결해놔야 protocol 관련 에러 없음
connection.connect();

var music_brief = 'music.id, music.title, music.artist';
var music_detial = '*';

/**
 * 서버 열려있는지 확인
 */
app.get('/', (req, res) => {
    res.send('test');
});


/**
 * /music
 * [POST] itunes_id, title, artist, genre, time, year => insert music if not in database(check itunes_id)
 */
app.post('/music', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var title = req.body.title;
    var artist = req.body.artist;
    var genre = req.body.genre;
    var time = req.body.time;
    var year = req.body.year;

    if(itunes_id && title && artist && genre && time && year) {
        var select_query = `select id from music where itunes_id=${itunes_id};`;
        connection.query(select_query, function(error, results, fields) {
            if(error) {
                res.json(query_error);
            }
            else {
                if(results.length == 0) {
                    var query = `insert into music(itunes_id, title, artist, genre, time, year)\
                                values(${itunes_id}, \"${title}\", \"${artist}\", \"${genre}\", ${time}, ${year});`;
                    connection.query(query, function(error, results, fields) {
                        if(error) {
                            res.json(query_error);
                        }
                        else {
                            console.log(results.insertId);
                            res.json({
                                'status': true
                            });
                        }
                    });
                }
                else {
                    res.json({
                        'status': false,
                        'log': 'already exists itunes_id'
                    });
                }
            }
        });
    }
    else res.json({
        'status': false,
        'log': 'wrong request body name'
    });
});


/**
 * /music
 * [GET] id, user_id => get music with user like, id 0 for get all music
 */
app.get('/music', (req, res) => {
    var id = req.query.id;
    var user_id = req.query.user_id;
    if(id && user_id) {
        var query = `select distinct *,
                        case when exists(select id from love where user_id=${user_id} and music_id=music.id)
                        then 1 else 0
                        end as islike
                    from music`;
        if(id != 0) query = `${query} where id=${id};`;
        connection.query(query, function(error, results, fields) {
            if(error) {
                res.json(query_error);
            }
            else {
                if(results.length == 0) {
                    res.json({
                        'status': false,
                        'log': `no music with id ${id}`
                    });
                }
                else res.json({
                    'status': true,
                    'body': (id == 0) ? results : results[0]
                });
            }
        });
    }
    else res.json({
        'status': false,
        'log': 'wrong request param error'
    });
});


/**
 * /login
 * [GET] email, type => signin check
 * [POST] email, name, type => signup action
 */
app.get('/login', (req, res) => {
    var email = req.query.email;
    var type = req.query.type;
    if(email && type) {
        var query = `select * from user where email=\"${email}\"and type=\"${type}\";`;
        connection.query(query, function(error, results, fields) {
            if(error) {
                res.json(query_error);
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

app.post('/login', (req, res) => {
    var email = req.body.email;
    var name = req.body.name;
    var type = req.body.type;
    if(email && name && type) {
        var query = `insert into user(email, name, type) values(\"${email}\", \"${name}\", \"${type}\");`
        connection.query(query, function(error, results, fields) {
            if(error) {
                res.json(query_error);
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


/**
 * /curation
 * [POST] title, content, ctype_id, music_id_list => create curation
 * [DELETE] id : delete curation
 */
app.post('/curation', (req, res) => {
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
                    res.json(query_error);
                }
                else {
                    for(music_id in music_id_list) {
                        var query_insert = `insert into curation_item(curation_id, music_id)\
                                            values(${results.insertId}, ${music_id});`;
                        connection.query(query_insert, function(error, results, fields) {
                            if(error) {
                                res.json(query_error);
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
    res.json({
        'status': true,
        'log': 'successfully insert curation data'
    });
});

app.delete('/curation', (req, res) => {
    var id = req.body.id;
    var query = `delete from curation where id=${id}`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            res.json(query_error);
        }
        else {
            res.json({
                'status': true
            });
        }
    });
});


/**
 * /curation/item
 * [GET] curation_id => get music(brief) list in curation
 * [POST] curation_id, music_id => add one music to curation
 * [DELETE] curation_id, music_id => delete one music in curation
 */
app.get('/curation/item', (req, res) => {
    var curation_id = req.query.curation_id;
    var query = `select music.id, music.title, music.artist from music\
                where music.id in (select music_id from curation_item where curation_id = ${curation_id});`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            res.json(query_error);
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

app.post('/curation/item', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id = req.body.music_id;
    var query = `insert into curation_item(curation_id, music_id) values(${curation_id}, ${music_id})`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
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

app.delete('/curation/item', (req, res) => {
    var curation_id = req.body.curation_id;
    var music_id = req.body.music_id;
    var query = `delete from curation_item where curation_id=${curation_id} and music_id=${music_id}`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
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


/**
 * /ctype
 * [GET] id => search ctype with id, 0 for search all
 * [POST] title => create ctype
 * [DELETE] id => delete ctype with id in ctype
 */
 app.get('/ctype', (req, res) => {
    var id = req.query.id;
    if(id) {
        var query = `select * from ctype`;
        if(id != 0) query = `${query} where id=${id};`;
        connection.query(query, function(error, results, fields) {
            if(error) {
                res.json(query_error);
            }
            else {
                if(results.length == 0) {
                    res.json({
                        'status': false,
                        'body': `no ctype with id ${id}`
                    });
                }
                res.json({
                    'status': true,
                    'body': id==0 ? results : results[0]
                });
            }
        })
    }
    else {
        res.json(query_error);
    }
});

app.post('/ctype', (req, res) => {
    var title = req.body.title;
    var query = `insert into ctype(title) values(\"${title}\");`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            res.json(query_error);
        }
        else {
            res.json({
                'status': true,
            });
        }
    });
});

app.delete('/ctype', (req, res) => {
    var id = req.body.id;
    var query = `delete from ctype where id=${id}`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            res.json(query_error);
        }
        else {
            res.json({
                'status': true,
            });
        }
    });
});


/**
 * /love
 * [POST] music_id, user_id => like music
 * [DELETE] music_id, user_id => dislike music
 */
app.post('/love', (req, res) => {
    var music_id = req.body.music_id;
    var user_id = req.body.user_id;
    var query = `insert into love(music_id, user_id) values(${music_id}, ${user_id})`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
        }
        else {
            res.json({
                'status': true,
                'body': 'like'
            })
        }
    });
});

app.delete('/love', (req, res) => {
    var music_id = req.body.music_id;
    var user_id = req.body.user_id;
    var query = `delete from love where music_id=${music_id} and user_id=${user_id}`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
        }
        else {
            console.log(results);
            res.json({
                'status': true,
                'body': 'unlike'
            });
        }
    });
});


/**
 * /playlist
 * [GET] user_id => get playlist of userid
 * [POST] user_id, title, visible => create playlist with userid
 * [DELETE] id => delete playlist of id(playlist)
 */
app.get('/playlist', (req, res) => {
   var user_id = req.query.user_id;
   var query = `select id, title from playlist where user_id=${user_id}`;
   connection.query(query, function(error, results, fields) {
       if(error) {
           console.log(error);
           res.json(query_error);
       }
       else {
           console.log(results);
           res.json({
               'status': true,
               'body': results
           });
       }
   });
});

app.post('/playlist', (req, res) => {
    var user_id = req.body.user_id;
    var title = req.body.title;
    var visible = req.body.visible;
    var query = `insert into playlist(user_id, title, visible) values(${user_id},\"${title}\",${visible})`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
        }
        else {
            console.log(results);
            res.json({
                'status': true,
                'body': 'insert success'
            });
        }
    })
});

app.delete('/playlist', (req, res) => {
    var id = req.body.id;
    var query = `delete from playlist where id=${id}`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
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


/**
 * /playlist/item
 * [GET] playlist_id => get music data in list
 * [POST] playlist_id, music_id => insert
 * [DELETE] playlist_id, music_id => delete
 */
app.get('/playlist/item', (req, res) => {
    var playlist_id = req.query.playlist_id;
    var query = `select * from music where music.id in (select music_id from playlist_item as pi where pi.playlist_id=${playlist_id})`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
        }
        else {
            console.log(results);
            res.json({
                'status': true,
                'body': results
            });
        }
    });
});

app.post('/playlist/item', (req, res) => {
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `insert into playlist_item(playlist_id, music_id) values(${playlist_id}, ${music_id})`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
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

app.delete('/playlist/item', (req, res) => {
    var playlist_id = req.body.playlist_id;
    var music_id = req.body.music_id;
    var query = `delete from playlist_item where playlist_id=${playlist_id} and music_id=${music_id}`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
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


/**
 * /friend
 * [GET] user_id => get friends list(id, name)
 * [POST] user_id, email => add friend state (user_id for apply, email for response user)
 */
app.get('/friend', (req, res) => {
    var user_id = req.query.user_id;
    var query = `select friend_id, accept from (
                (select user_id_response as friend_id, accept from friend where user_id_apply=${user_id})
                join (select user_id_apply as friend_id, accept from friend where user_id_response=${user_id}));`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
        }
        else {
            console.log(results);
            res.json({
                'status': true,
                'body': results
            });
        }
    });
});

app.post('/friend', (req, res) => {
    var user_id = req.body.user_id;
    var email = req.body.email;
    var query = `insert into friend(user_id_apply, user_id_response, accept) values(user_id, (select id from user where user.email=${email}), false);`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            console.log(error);
            res.json(query_error);
        }
        else {
            console.log(results);
            res.json({
                'status': true,
                'body': 'friend apply success'
            });
        }
    });
});


/**
 * start express server
 */
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
