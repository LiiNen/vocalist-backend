require("dotenv").config();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
})

connection.connect();

connection.query('select * from a', function(error, results, fields) {
    if(error) console.log(error);
    else {
        console.log(results);
        results.map(function(packet) {
            console.log('------');
            console.log('packet.id: ', packet.id);
            console.log('packet.name: ', packet.name);
        });
    }
});

connection.end();
