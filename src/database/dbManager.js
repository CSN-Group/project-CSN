const sqlite = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite(dbPath);

exports.getReadings = function() { //Get all readings from the database, as an array of objects.
    const sql = 'SELECT * FROM readings';
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}

//Convert

exports.addReading = function(upSpeed, downSpeed, wifiStr, ping, connectType) { //Add a new reading to the database.
    const unixStamp = new Date().getTime();
    const sql = `INSERT INTO readings (timeStamp, upSpeed, downSpeed, wifiStr, ping, connectType)
    VALUES (?, ?, ?, ?, ?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(unixStamp, upSpeed, downSpeed, wifiStr, ping, connectType);    
}