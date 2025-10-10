const graphContainer = document.getElementById('historyGraph');
let graph = null;

async function initGraph(){ 

  createDayGraph();

  document.getElementById('graphPingButton').addEventListener('click', () => createDayGraph('ping'));
  document.getElementById('graphUpspeedButton').addEventListener('click', () => createDayGraph('upSpeed'));
  document.getElementById('graphDownspeedButton').addEventListener('click', () => createDayGraph('downSpeed'));
  document.getElementById('graphWifiButton').addEventListener('click', () => createDayGraph('wifiStr'));
  document.getElementById('weekButton').addEventListener('click', () => createDayGraph('upSpeed', 'week'));  
}

// Helper functions to extract specific values from the readings. timeStamp, upSpeed, downSpeed, etc.
function extractValue(data,key) {
    const values = [];
    data.forEach(reading => {
       values.push(reading[key]);        
    });
    return values;
}

// Convert unix timestamps to human-readable time (HH:MM)! NOT NEEDED!
function convertTimes(timestamps) {
    const times = [];
    timestamps.forEach(stamp => {        
        const time = dbManager.convertToHourMin(stamp);
        times.push(time);
    });
    return times;
}

/* NOT USED ANYMORE!
function findStartOfDay(timestamp) {
  date=new Date(timestamp);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return startOfDay.getTime();
}*/

//Set your mainmetric and choose between day or week for readings.
async function createDayGraph(mainMetric = "upSpeed", range = "day"){ 
  if(graph){graph.destroy()}; //There can only be ONE graph in a canvas.
  
  let readings;
  if(range === 'week'){
    readings = await dbManager.getReadings();    
  }else{
    //const unixStamp = new Date().getTime();
    //const dateStamp = dbManager.convertToDateStamp(unixStamp); //YYYYMMDD 
    readings = await dbManager.getDayReadings(20251007); //HARDCODED! CHANGE WHEN NOT TESTING!
  }

  const times= extractValue(readings, 'timeStamp');
  const upSpeeds = extractValue(readings, 'upSpeed');
  const downSpeeds = extractValue(readings, 'downSpeed');
  const pings = extractValue(readings, 'ping');
  const wifiStrs = extractValue(readings, 'wifiStr');

  
  const start = times[0];
  const end = times[times.length-1] 

  const metrics = { upSpeed: upSpeeds, downSpeed: downSpeeds, ping: pings, wifiStr: wifiStrs};
  const labels = { upSpeed: 'Upload Speed (Mbps)', downSpeed: 'Downloadspeed (Mbps)', ping: 'Ping (ms)', wifiStr: 'WiFi Strength (%)' };
  const borderColors = { upSpeed: 'blue', downSpeed: 'yellow', ping: 'green', wifiStr: 'orange'};

  const mainData = metrics[mainMetric];

  graph = new Chart(graphContainer, {
    type: "line",
    data: {
      labels: times,
      datasets: [{
        label: labels[mainMetric],
        data: mainData,
        borderColor: borderColors[mainMetric],
        borderWidth: 1,
        tension: 0,
        pointRadius: 1,
      }]
    },
    options: {
      scales: { 
        x: { 
          type: 'time', 
          time: {
            unit: range === 'week' ?'day':'hour',
            displayFormats: range === 'week'
            ? {day: 'MMM dd' }
            : { hour: 'HH:mm' }
          },
          min: start,  
          max: end             
        },
        y: {
          title: { display: true, text: labels[mainMetric] }
        }
      },
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Readings", font: { size: 14 } },
        tooltip: {
          displayColors: false,
          callbacks: {
          label: function(context) {
          const i = context.dataIndex;         
         // Build all the tooltip lines
          const tooltipLines = {
          upSpeed: `Upspeed: ${upSpeeds[i]} Mbps`,
          downSpeed: `Downspeed: ${downSpeeds[i]} Mbps`,
          ping: `Ping: ${pings[i]} ms`,
          wifiStr: `WiFi Strength: ${wifiStrs[i]}%`
        };

        // Put the main metric first
        const order = ['upSpeed', 'ping','downSpeed', 'wifiStr'].filter(k => k !== mainMetric);
        return [tooltipLines[mainMetric], ...order.map(k => tooltipLines[k])];
          }
          }
        }
      }
      }
  });
}