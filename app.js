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

app.get('/', (req, res) => {
    res.send('test');
});

app.post('/music/add', (req, res) => {
    var itunes_id = req.body.itunes_id;
    var title = req.body.title;
    var artist = req.body.artist;
    var genre = req.body.genre;
    var time = req.body.time;
    var year = req.body.year;

    if(itunes_id && title && artist && genre && time && year) {
        var select_query = `select * from music where itunes_id=${itunes_id};`;
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

app.get('/music/search', (req, res) => {
    var id = req.query.id;
    if(id) {
        var query = `select * from music where id=${id};`;
        connection.query(query, function(error, results, fields) {
            if(error) {
                res.json(query_error);
            }
            else {
                if(results.length == 0) {
                    res.json({
                        'status': false,
                        'log': `no music with id ${id}`
                    })
                }
                else res.json({
                    'status': true,
                    'body': results[0]
                })
            }
        });
    }
    else res.json({
        'status': false,
        'log': 'wrong request param error'
    });
});

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

app.post('/curation/add', (req, res) => {
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

app.post('/ctype/add', (req, res) => {
    var title = req.body.title;
    var query = `insert into ctype(title) values(\"${title}\");`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            res.json(query_error);
        }
        else {
            res.json({
                'status': 'true',
            });
        }
    });
});

app.get('/ctype/search', (req, res) => {
    var id = req.query.id;
    var query = `select * from ctype where id=${id};`;
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
                'body': results[0]
            });
        }
    })
});

app.get('/ctype/all', (req, res) => {
    var query = `select * from ctype;`;
    connection.query(query, function(error, results, fields) {
        if(error) {
            res.json(query_error);
        }
        else {
            res.json({
                'status': true,
                'body': results
            })
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

