const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://vawmwnetilhsxmgjrrmm.supabase.co' // Dont forget to change the way the key is shown?
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhd213bmV0aWxoc3htZ2pycm1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTI2NjcyOSwiZXhwIjoyMDc0ODQyNzI5fQ.0ED6IBCcHgTo4mZO5Qx_x6QE9kWlaUd5gFUIZKAeGTk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function addReadingSupabase(reading) {
  const result = await supabase
    .from('testTable') // Name of the table in Supabase
    .insert(reading);
  const data = result.data;
  const error = result.error;
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data synced successfully:', data);
  }
}

module.exports = { addReadingSupabase };
