var mysql = require('mysql');

// setup mysql
var dbcon = mysql.createConnection({
    host: 'localhost',
    database: 'contacts',
    multipleStatements:true,
    user: 'ivan',
    password: 'ivan24'
});

dbcon.connect(function (err) {
    if (err) throw err;
    console.log("Connected to db");
});

module.exports = dbcon;