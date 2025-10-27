const { createClient } = require('@supabase/supabase-js')
const {ipcRenderer} = require('electron');
const {addAdminInfo,getAdminInfoTime,deleteAll} = require('../database/dbManager.js')

let supabaseUrl,
    supabaseKey,
    supabase;

function initSupabase(KEY, URL){
  supabaseUrl = URL;
  supabaseKey = KEY;
  supabase = createClient(supabaseUrl, supabaseKey);
}
async function getGlobal(key){
  return await ipcRenderer.invoke('getGlobal', key);  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addReadingSupabase(upSpeed, downSpeed, ping, wifiStr, dateStamp) {  
  let mac = await getGlobal('mac'); //Spin to WIN!
  while(!mac || mac=== null){
    sleep(5);
    mac = await getGlobal('mac');    
  }  
  const result = await supabase
    .from('readings') // Name of the table in Supabase
    .insert([{upSpeed, downSpeed, ping, wifiStr, dateStamp, mac}]);
  const data = result.data;
  const error = result.error;
  if (error) {
    console.error('Error inserting data:', error);
  }
  else {
    console.log('Data transfered successfully:', data);
  }
}

//Returns all the logged days from a specific MAC address.
async function fetchMonthlyHistory(year,month){  
  const startOfMonth = Number(`${year}${String(month).padStart(2, "0")}01`);  
  const endOfMonth = Number(`${year}${String(month).padStart(2, "0")}${new Date(year, month, 0).getDate()}`);
  const myMac = await getGlobal('mac'); 
  
  const { data, error } = await supabase
      .from('readings')
      .select('upSpeed,downSpeed,ping,wifiStr,dateStamp') // Fetch all columns
      .eq('mac', myMac) // Filter by MAC
      .gte('dateStamp', startOfMonth)  // greater than or equal to startOfMonth
      .lte('dateStamp', endOfMonth)    // less than or equal to endOfMonth
      .order('dateStamp', { ascending: true });
  if (error) {
      console.error("Error fetching data:", error);
      return [];
  }
  else{    
    return data;
  }

}

async function fetchAvailableMonths(){
  let myMac = await getGlobal('mac');
  while(!myMac || myMac=== null){ //Waiting for the mac to be found
    sleep(5);
    myMac = await getGlobal('mac');   
  } 
  const { data, error } = await supabase
      .from('readings')
      .select('dateStamp') // Datestamp
      .eq('mac', myMac) // Filter by MAC 
      
  if (error) {
      console.error("Error fetching data:", error);
      return []; }
 
 const yearsMonths = [...new Set(   //Save unique year month combos into an array. The set makes sure everything is unique
  data.map(item => item.dateStamp.toString().slice(0, 6))
)].map(yearMonth => ({
  year: yearMonth.slice(0,4),
  month: yearMonth.slice(4,6)
}));

  return yearsMonths;
}

async function fetchAdminInfo(){
  const { data,error} = await supabase
    .from('adminMessage')
    .select('docText,suppNr,suppLink,timeStamp') 
    .eq('orgNr', 5741)
    .order('id', {ascending:false})
    .limit(1)
    .single(); //Returns only ONE object

if (error){
  console.error("Error fetching data:", error);
  return null;
}else{
  return data;
}}

async function syncLocalDatabase(){
    const adminInfo = await fetchAdminInfo();      
    if(
      adminInfo && 
      (!getAdminInfoTime() ||adminInfo.timeStamp > getAdminInfoTime().timeStamp)) //If we successfully fetched the data, we put it into our database!
      { 
        deleteAll('admin'); //Clears out old admindata!
        addAdminInfo(adminInfo.docText,adminInfo.suppNr,adminInfo.suppLink,adminInfo.timeStamp);  
    }    
}

module.exports = {initSupabase, addReadingSupabase, fetchMonthlyHistory, syncLocalDatabase, fetchAvailableMonths};