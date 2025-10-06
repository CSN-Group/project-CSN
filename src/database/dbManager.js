const sqlite = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite(dbPath);

function getReadings() { //Get all readings from the database, as an array of objects.
    const sql = 'SELECT * FROM readings';
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}

function addReading(upSpeed, downSpeed, wifiStr, ping, connectType) { //Add a new reading to the database.
    const unixStamp = new Date().getTime();
    const sql = `INSERT INTO readings (timeStamp, upSpeed, downSpeed, wifiStr, ping, connectType)
    VALUES (?, ?, ?, ?, ?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(unixStamp, upSpeed, downSpeed, wifiStr, ping, connectType);    
}

function deleteOldReadings(cutoffTime) { //Delete readings older than cutoffTime. Needed?
    const sql = 'DELETE FROM readings WHERE timeStamp < ?';
    const stmt = db.prepare(sql);
    stmt.run(cutoffTime);
}

function deleteAllReadings() { //Delete all readings from the database.
    const sql = 'DELETE FROM readings';
    const stmt = db.prepare(sql);
    stmt.run();
}

function convertToDateString(unixStamp) {
    const date = new Date(unixStamp);
    const formattedDate =
    date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0') + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0') + ':' +
    String(date.getSeconds()).padStart(2, '0');
    return formattedDate;
}

module.exports = { getReadings, addReading, deleteOldReadings, deleteAllReadings, convertToDateString };