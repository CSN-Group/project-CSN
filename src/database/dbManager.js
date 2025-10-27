const sqlite = require('better-sqlite3');
const path = require('path');


const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite(dbPath);

async function cleanLocalDatabase(){
    const {addReadingSupabase} = require('../database/supabaseHandler.js')    
    const date = new Date().getTime();    
    const dateStamp = convertToDateStamp(date);    
    const cutoffDate = subtractDaysFromDatestamp(dateStamp,6);        
    const oldDates = getUniqueDateStampsBefore(cutoffDate);    
    oldDates.forEach(date => {
        const sumDay = summarizeDay(date);       
        addReadingSupabase(sumDay.upSpeed,sumDay.downSpeed,sumDay.ping,sumDay.wifiStr,sumDay.dateStamp);
    })
    deleteOldReadings(cutoffDate);
}

function getReadings() { //Get all readings from the database, as an array of objects.
    const sql = 'SELECT * FROM readings';
    let statement = db.prepare(sql);
    let result = statement.all();
    return result;
}

function getAdminInfoTime(){
    const sql = 'SELECT timeStamp FROM admin ORDER BY id DESC LIMIT 1';
    const statement= db.prepare(sql);
    const result = statement.get(); //Returns one single object!
    return result;
}

function getAdminDocument(){
    const sql = 'SELECT docText FROM admin ORDER BY id DESC LIMIT 1';
    const statement = db.prepare(sql);
    const result = statement.get(); //Returns one single object!
    return result;
}

function getAdminSupportInfo(){
    const sql = 'SELECT suppNr,suppLink FROM admin ORDER BY id DESC LIMIT 1';
    const statement = db.prepare(sql);
    const result = statement.get(); //Returns one single object!
    return result;
}

//get today's readings? Might be needed.
function getDayReadings(dateStamp) {    
    const sql = 'SELECT * FROM readings WHERE dateStamp = ?';
    const statement = db.prepare(sql);
    let result = statement.all(dateStamp);
    return result;
}

function getUniqueDateStampsBefore(limit) {
    const sql = 'SELECT DISTINCT dateStamp FROM readings WHERE dateStamp < ? ORDER BY dateStamp';
    const statement = db.prepare(sql);
    const result = statement.all(limit);
    return result.map(row => row.dateStamp);
}

function getUniqueDateStamps() {
    const sql = 'SELECT DISTINCT dateStamp FROM readings ORDER BY dateStamp';
    const statement = db.prepare(sql);
    const result = statement.all();
    return result.map(row => row.dateStamp);
}

function getActiveSessions(datestamp){
    const sql = 'SELECT startTime, stopTime FROM activeTime WHERE dateStamp = ?';
    const statement = db.prepare(sql);
    let result = statement.all(datestamp);
    return result;
}


async function addReading(upSpeed, downSpeed, wifiStr, ping, connectType) { //Add a new reading to the database.
    const unixStamp = new Date().getTime();
    const dateStamp = convertToDateStamp(unixStamp);
    const sql = `INSERT INTO readings (timeStamp, upSpeed, downSpeed, wifiStr, ping, connectType, dateStamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const statement = db.prepare(sql);
    statement.run(unixStamp, upSpeed, downSpeed, wifiStr, ping, connectType, dateStamp);    
}

async function addActiveTime(start, stop, totMin){
    const sql = `INSERT INTO activeTime (startTime,stopTime,minutesWorked, dateStamp)
    VALUES (?, ?, ?, ?)`;
    const dateStamp = convertToDateStamp(start);
    console.log(dateStamp);
    const statement = db.prepare(sql);
    statement.run(start,stop,totMin,dateStamp);
}


function summarizeDay(dateStamp) {
    const reading = getDayReadings(dateStamp);   
    let upSpeed = 0;
    let downSpeed = 0;
    let ping = 0;
    let wifiStr = 0;
    const count = reading.length;
    if (count === 0){return;}

    reading.forEach(reading => {
        upSpeed += reading.upSpeed;
        downSpeed += reading.downSpeed;
        ping += reading.ping;
        wifiStr += reading.wifiStr;        
    })
    upSpeed = (upSpeed / count).toFixed(2);
    downSpeed = (downSpeed / count).toFixed(2);
    ping = Math.floor(ping / count);
    wifiStr = Math.floor(wifiStr / count);   
    const avgValues = {upSpeed, downSpeed, ping ,wifiStr, dateStamp};
    return avgValues;
}

function deleteOldReadings(cutoffTime) { //Delete readings older than cutoffTime. Needed?
    const sql = 'DELETE FROM readings WHERE dateStamp < ?';
    const statement = db.prepare(sql);
    statement.run(cutoffTime);
}


function deleteAll(table) { //Delete all rows from a table in the local DB
    const sql = 'DELETE FROM ' + table;
    const statement = db.prepare(sql);
    statement.run();
}

function convertToDateStamp(unixStamp) {
    const date = new Date(unixStamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based    
    const day = String(date.getDate()).padStart(2, '0');   
    return parseInt(`${year}${month}${day}`,10);
}

function subtractDaysFromDatestamp(dateStamp, dayAmount){ 
    //Split the dateStamp into year, month, day
    const months31 = [1,3,5,7,8,10,12];
    const months30 = [4,6,9,11];    
    let year = Math.floor(dateStamp / 10000);
    let month = Math.floor((dateStamp % 10000) / 100);
    let day = dateStamp % 100;            
    for (let i = 0; i < dayAmount; i++) {
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

function addAdminInfo(docText, suppNr, suppLink, timeStamp){
    const sql = `INSERT INTO admin (docText, suppNr, suppLink,timeStamp)
    VALUES (?, ?, ?, ?)`;
    const statement = db.prepare(sql);
    statement.run(docText, suppNr, suppLink, timeStamp);
}


module.exports = { deleteAll,getActiveSessions, getAdminDocument, getAdminSupportInfo, getAdminInfoTime,getReadings,getDayReadings, getUniqueDateStamps, getUniqueDateStampsBefore, addReading, deleteOldReadings, convertToDateStamp, summarizeDay, cleanLocalDatabase, addAdminInfo, addActiveTime };
