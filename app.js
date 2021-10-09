/**
 * express setting
 */

var express = require('express');
var app = express();

var cors = require('cors');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({'extended' : true}));
app.use(express.static('public'));
app.use(cors());


/** 
 * mysql stting & connection
 */
require("dotenv").config();

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect(function(error) {
  if(error) throw error;
});


// server listening test
app.get('/', (req, res) => {
  res.send('server is running');
});

var music = require('./routes/music')(connection);
app.use('/music', music);

var playlist = require('./routes/playlist')(connection);
app.use('/playlist', playlist);

var playlistItem = require('./routes/playlistItem')(connection);
app.use('/playlist/item', playlistItem);

var curation = require('./routes/curation')(connection);
app.use('/curation', curation);

var curationItem = require('./routes/curationItem')(connection);
app.use('/curation/item', curationItem);

var friend = require('./routes/friend')(connection);
app.use('/friend', friend);

var love = require('./routes/love')(connection);
app.use('/love', love);

var ctype = require('./routes/ctype')(connection);
app.use('/ctype', ctype);

var login = require('./routes/login')(connection);
app.use('/login', login);


// start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

module.exports = connection;