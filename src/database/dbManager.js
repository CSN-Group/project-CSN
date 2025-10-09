const sqlite = require('better-sqlite3');
const path = require('path');
const {addReadingSupabase} = require('./supabaseHandler.js');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite(dbPath);

function getReadings() { //Get all readings from the database, as an array of objects.
    const sql = 'SELECT * FROM readings';
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}

//get today's readings? Might be needed.
function getDayReadings(dateStamp) {    
    const sql = 'SELECT * FROM readings WHERE dateStamp = ?';
    const stmt = db.prepare(sql);
    let res = stmt.all(dateStamp);
    return res;
}

function getUniqueTimeStampsBefore(limit) {
    const sql = 'SELECT DISTINCT dateStamp FROM readings WHERE dateStamp < ? ORDER BY dateStamp';
    const stmt = db.prepare(sql);
    const res = stmt.all(limit);
    return res;
}

function addReading(upSpeed, downSpeed, wifiStr, ping, connectType) { //Add a new reading to the database.
    const unixStamp = new Date().getTime();
    const day = unixStamp.getDay(); //Using for potential future history filtering.
    const sql = `INSERT INTO readings (timeStamp, upSpeed, downSpeed, wifiStr, ping, connectType, dateStamp)
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

function summarizeDay(dateStamp) {
    const reading = getDayReadings(dateStamp);   
    let avgUpSpeed = 0;
    let avgDownSpeed = 0;
    let avgPing = 0;
    let avgWifi = 0;
    const count = reading.length;

    reading.forEach(reading => {
        avgUpSpeed += reading.upSpeed;
        avgDownSpeed += reading.downSpeed;
        avgPing += reading.ping;
        avgWifi += reading.wifiStr;        
    })
    avgUpSpeed = (avgUpSpeed / count).toFixed(2);
    avgDownSpeed = (avgDownSpeed / count).toFixed(2);
    avgPing = Math.floor(avgPing / count);
    avgWifi = Math.floor(avgWifi / count);          
    addReadingSupabase(avgUpSpeed, avgDownSpeed, avgPing, avgWifi, dateStamp);   
}

function deleteOldReadings(cutoffTime) { //Delete readings older than cutoffTime. Needed?
    const sql = 'DELETE FROM readings WHERE dateStamp < ?';
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
    return parseInt(`${year}${month}${day}`,10);
}

function subtract3FromDatestamp(dateStamp){ 
    //Split the dateStamp into year, month, day
    const months31 = [1,3,5,7,8,10,12];
    const months30 = [4,6,9,11];    
    const year = Math.floor(dateStamp / 10000);
    const month = Math.floor((dateStamp % 10000) / 100);
    const day = dateStamp % 100;            
    for (let i = 0; i < 3; i++) {
        day--;
        if (day < 1) {
            month--;
            if (month < 1) {
                month = 12;
                year--;
            }
            if (months31.includes(month)) {
                day = 31;
            } else if (months30.includes(month)) {
                day = 30;
            }else{
                day = 28; //Ignoring leap years for simplicity.
            }   
        }
    }
    const newDateStamp = parseInt(`${year}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`,10);
    return newDateStamp;
}

/*
function convertToHourMin(unixStamp) {    //Not needed anymore?
    const date = new Date(unixStamp);    
    const formattedTime =
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0');    
    return formattedTime;
}*/

module.exports = { getReadings,getDayReadings, getUniqueTimeStampsBefore, addReading, deleteOldReadings, deleteAllReadings, convertToDateStamp, summarizeDay };
