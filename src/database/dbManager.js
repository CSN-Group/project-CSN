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

exports.addReading = function(value) { //Add a new reading to the database.
    const sql = `INSERT INTO readings (lastStart) VALUES ('${value}')`;
    db.exec(sql);
}