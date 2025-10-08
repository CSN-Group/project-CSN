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

//get today's readings? Might be needed.
function getTodaysReadings(unixStamp) {    
    const todayDateStamp = convertToDateStamp(unixStamp); //YYYYMMDD
    const sql = 'SELECT * FROM readings WHERE dateStamp = ?';
    const stmt = db.prepare(sql);
    let res = stmt.all(todayDateStamp);
    return res;
}

function addReading(upSpeed, downSpeed, wifiStr, ping, connectType) { //Add a new reading to the database.
    const unixStamp = new Date().getTime();
    const day = unixStamp.getDay(); //Using for potential future history filtering.
    const sql = `INSERT INTO readings (timeStamp, upSpeed, downSpeed, wifiStr, ping, connectType, dayID)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(unixStamp, upSpeed, downSpeed, wifiStr, ping, connectType, day);    
}
/*
function addReading(unix,upSpeed, downSpeed, wifiStr, ping, connectType, dateStamp) { //Add a new reading to the database.
    //const unixStamp = new Date().getTime();
    //const day = unixStamp.getDay(); //Using for potential future history filtering.
    const sql = `INSERT INTO readings (timeStamp, upSpeed, downSpeed, wifiStr, ping, connectType, dateStamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const stmt = db.prepare(sql);
    stmt.run(unix, upSpeed, downSpeed, wifiStr, ping, connectType, dateStamp);    
}*/

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

function convertToDateStamp(unixStamp) {
    const date = new Date(unixStamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based    
    const day = String(date.getDate()).padStart(2, '0');   
    return parseInt(`${year}${month}${day}`);
}

function checkDate(dateStamp){
    
  for (let i = 0; i < 3; i++) {
    ;
}
}

function convertToHourMin(unixStamp) {    
    const date = new Date(unixStamp);    
    const formattedTime =
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0');    
    return formattedTime;
}

module.exports = { getReadings,getTodaysReadings, addReading, deleteOldReadings, deleteAllReadings, convertToHourMin, convertToDateStamp };
