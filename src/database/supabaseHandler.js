const { createClient } = require('@supabase/supabase-js')
const {ipcRenderer} = require('electron');

const supabaseUrl = 'https://vawmwnetilhsxmgjrrmm.supabase.co' // Dont forget to change the way the key is shown?
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhd213bmV0aWxoc3htZ2pycm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2NjcyOSwiZXhwIjoyMDc0ODQyNzI5fQ.0ED6IBCcHgTo4mZO5Qx_x6QE9kWlaUd5gFUIZKAeGTk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function getGlobal(key){
  return await ipcRenderer.invoke('getGlobal', key);  
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addReadingSupabase(avgUpSpeed, avgDownSpeed, avgPing, avgWifi, dateStamp) {  
  let mac = await getGlobal('mac'); //Spin to WIN!
  while(!mac || mac=== null){
    sleep(5);
    mac = await getGlobal('mac');    
  }  
  const result = await supabase
    .from('readings') // Name of the table in Supabase
    .insert([{avgUpSpeed, avgDownSpeed, avgPing, avgWifi, dateStamp, mac}]);
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
async function fetchMonthlyHistory(year,month,myMac){
  const startOfMonth = Number(`${year}${String(month).padStart(2, "0")}01`);
  const endOfMonth = Number(`${year}${String(month).padStart(2, "0")}${new Date(year, month, 0).getDate()}`);

  const { data, error } = await supabase
      .from('readings')
      .select('avgUpSpeed','avgDownSpeed','avgPing','avgWifi', 'dateStamp') // Fetch all columns
      .eq('mac', myMac) // Filter by MAC
      .gte('dateStamp', startOfMonth)  // greater than or equal to startOfMonth
      .lte('dateStamp', endOfMonth)    // less than or equal to endOfMonth
      .order('dateStamp', { ascending: false }); // Optional: newest first
  if (error) {
      console.error("Error fetching data:", error);
      return [];
  }
  else{    
    return data;
  }

}

module.exports = { addReadingSupabase, fetchMonthlyHistory };