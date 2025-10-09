const graphContainer = document.getElementById('historyGraph');
let graph = null;

async function initGraph(){
  //const unixStamp = new Date().getTime();
  //const dateStamp = dbManager.convertToDateStamp(unixStamp); //YYYYMMDD
  const readings = await dbManager.getDayReadings(20251008); //CHECK HERE! Hardcoded for now  
  createDayGraph(readings, 'ping');  
}

//dbManager.summarizeDay(20251008);

async function historyGraph(){
  //graph.destroy();
  const myMac = await window.systemInfo.getGlobal('mac');  
  const history= await dbManager.fetchHistory(myMac);
  console.log(history);
  createGraph(graphContainer,history);
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

function findStartOfDay(timestamp) {
  date=new Date(timestamp);
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return startOfDay.getTime();
}


function createDayGraph(readings, mainMetric = "upSpeed"){  
  const times= extractValue(readings, 'timeStamp');
  const upSpeeds = extractValue(readings, 'upSpeed');
  const downSpeeds = extractValue(readings, 'downSpeed');
  const pings = extractValue(readings, 'ping');
  const wifiStrs = extractValue(readings, 'wifiStr');
  const startOfDay = findStartOfDay(times[0]);
  const endOfDay = startOfDay + 86400000; // 24 hours in milliseconds MAGIC NUMBER!  

  const metrics = { upSpeed: upSpeeds, downSpeeds: downSpeeds, ping: pings, wifiStr: wifiStrs};
  const labels = { upSpeed: 'Upload Speed (Mbps)', downSpeeds: 'Downloadspeed (Mbps)', ping: 'Ping (ms)', wifiStr: 'WiFi Strength (%)' };
  const borderColors = { upSpeed: 'blue', downSpeeds: 'yellow', ping: 'green', wifiStr: 'orange'};

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
          time: { unit: 'hour', displayFormats: { hour: 'HH:mm' } },
          min: times[0],  
          max: endOfDay             
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