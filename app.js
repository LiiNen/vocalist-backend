/**
 * express setting
 */

var express = require('express');
var app = express();
const port = 3000;

app.use(express.json())
app.use(express.urlencoded({'extended' : true}));
app.use(express.static('public'));

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
})

app.get('/', (req, res) => {
    res.send('test');
})

app.get('/music/all', (req, res) => {
    connection.connect();
    connection.query('select * from music', function(error, results, fields) {
        if(error) console.log(error);
        else {
            console.log(results);
            results.map(function(packet) {
                console.log('------');
                console.log('packet.musicId: ', packet.musicId);
                console.log('packet.title: ', packet.title);
                console.log('packet.artist: ', packet.artist);
            });
            res.json(results);
        }
    });
    connection.end();
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

