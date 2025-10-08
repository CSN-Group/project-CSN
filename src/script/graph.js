const unixStamp = new Date().getTime();
const readings = dbManager.getTodaysReadings(unixStamp);

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


function createGraph(){
  const times= extractValue(readings, 'timeStamp');
  const upSpeeds = extractValue(readings, 'upSpeed');
  const pings = extractValue(readings, 'ping');
  const wifiStrs = extractValue(readings, 'wifiStr');
  const startOfDay = findStartOfDay(times[0]);
  const endOfDay = startOfDay + 86400000; // 24 hours in milliseconds MAGIC NUMBER!

  const graph = document.getElementById('historyGraph');

  new Chart(graph, {
    type: "line",
    data: {
      labels: times,
      datasets: [{
        label: "Upload Speed (Mbps)",
        data: upSpeeds,
        borderColor: 'blue',
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
          title: { display: true, text: 'Speed (Mbps)' }
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
          const speed = upSpeeds[i];
          const ping = pings[i];
          const wifi = wifiStrs[i];
          return [`Speed: ${speed} Mbps`, `Ping: ${ping} ms`, `WiFi Strength: ${wifi}%`];
          }
          }
          }
      }
      }
  });
}

createGraph();