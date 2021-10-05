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

// 처음에 연결해놔야 protocol 관련 에러 없음
connection.connect();


app.get('/', (req, res) => {
    res.send('test');
});

app.get('/login', (req, res) => {
    var email = req.query.email;
    var type = req.query.type;
    if(email && type) {
        var query = 'select * from user where email=\"' + email + '\"and type=\"' + type + '\"';
        connection.query(query, function(error, results, fields) {
            if(error) {
                console.log(error);
                res.json(null);
            }
            else {
                if(results.length == 0) {
                    res.json(null);
                }
                else res.json({
                    'exist': true,
                    'body': results[0]
                });
            }
        });
    }
    else res.json(null);
});

app.post('/login', (req, res) => {
    var email = req.body.email;
    var name = req.body.name;
    var type = req.body.type;
    if(email && name && type) {
        var query = 'insert into user(email, name, type) values(\"' + email + '\", \"' + name + '\", \"' + type + '\");'
        connection.query(query, function(error, results, fields) {
            if(error) {
                console.log(error);
                res.json(null);
            }
            else {
                res.json({
                    'success': (results.protocol41 == true),
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
    else res.json(null);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

