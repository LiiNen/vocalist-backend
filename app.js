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

// server listening test
app.get('/', (req, res) => {
  res.send('server is running');
});

var login = require('./routes/login')();
app.use('/login', login);

var music = require('./routes/music')();
app.use('/music', music);

var love = require('./routes/love')();
app.use('/love', love);

var playlist = require('./routes/playlist')();
app.use('/playlist', playlist);

var playlistItem = require('./routes/playlistItem')();
app.use('/playlist/item', playlistItem);

var curation = require('./routes/curation')();
app.use('/curation', curation);

var curationItem = require('./routes/curationItem')();
app.use('/curation/item', curationItem);

var ctype = require('./routes/ctype')();
app.use('/ctype', ctype);

var friend = require('./routes/friend')();
app.use('/friend', friend);

var user = require('./routes/user')();
app.use('/user', user);

var bugReport = require('./routes/bugReport')();
app.use('/bug', bugReport);

var search = require('./routes/search')();
app.use('/search', search);

var dev = require('./routes/dev')();
app.use('/dev', dev);

var version = require('./routes/version')();
app.use('/version', version);

var policy = require('./routes/policy')();
app.use('/policy', policy);

// start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});