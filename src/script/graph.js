const graphContainer = document.getElementById('historyGraph');
let graph = null;

async function initDrop(){
  const dropdown = document.getElementById("dayDropdown");
  //const dropdownBtn = document.getElementById("dayButton");

  const dates = dbManager.getUniqueDateStamps();

  dates.forEach(num => {
    const btn = document.createElement("button");
    btn.textContent = num;
    btn.addEventListener("click", () => {
      console.log("Clicked:", num); //Handle click here
    });
    dropdown.appendChild(btn);
  });
}

async function initGraph(){
  //dbManager.syncLocalDatabase();  
  createDayGraph();  
  dbManager.cleanLocalDatabase();
  document.getElementById('graphPingButton').addEventListener('click', () => createDayGraph('ping'));
  document.getElementById('graphUpspeedButton').addEventListener('click', () => createDayGraph('upSpeed'));
  document.getElementById('graphDownspeedButton').addEventListener('click', () => createDayGraph('downSpeed'));
  document.getElementById('graphWifiButton').addEventListener('click', () => createDayGraph('wifiStr'));
  document.getElementById('graphInterruptButton').addEventListener('click', () => createDayGraph('interrupts'));
  document.getElementById('weekButton').addEventListener('click', () => createDayGraph('ping', 'week'));
  document.getElementById('monthButton').addEventListener('click', () => createDayGraph('ping', 'month'));  
}

// Helper functions to extract specific values from the readings. timeStamp, upSpeed, downSpeed, etc.
function extractValue(data,key) {
    const values = [];
    data.forEach(reading => {
       values.push(reading[key]);        
    });
    return values;
}

function dateStampToDate(dateStamp) {
  const year = Math.floor(dateStamp / 10000);
  const month = Math.floor((dateStamp % 10000) / 100) - 1; // JS months are 0-based
  const day = dateStamp % 100;
  return new Date(year, month, day);
}

//Set your mainmetric and choose between day or week for readings.
async function createDayGraph(mainMetric = "upSpeed", range = "day", year=2025, month=10){ 
  if(graph){graph.destroy()}; //There can only be ONE graph in a canvas.
  
  let readings;

  //Based on range, fetch data in different ways.
  if(range === 'week'){
    const datestamps = dbManager.getUniqueDateStamps();    
    readings = [];
    datestamps.forEach( stamp => {
      readings.push(dbManager.summarizeDay(stamp));
    })            
  }
  else if(range === "month"){    
    readings = await dbManager.fetchMonthlyHistory(year,month);    
  }
  else{
    const unixStamp = new Date().getTime();
    const dateStamp = dbManager.convertToDateStamp(unixStamp); //YYYYMMDD 
    readings = await dbManager.getDayReadings(dateStamp); 
  }

  //Time and metric arrays
  const times = range === 'week' || range === 'month'
  ? readings.map(row => dateStampToDate(row.dateStamp))
  : extractValue(readings, 'timeStamp');

  
  const upSpeeds = extractValue(readings, 'upSpeed');
  const downSpeeds = extractValue(readings, 'downSpeed');
  const pings = extractValue(readings, 'ping');
  const wifiStrs = extractValue(readings, 'wifiStr');
  let interrupts = createInterruptArray(upSpeeds,downSpeeds,pings,wifiStrs);
  
    
  const start = times[0];
  const end = times[times.length-1]
  
  const metrics = { upSpeed: upSpeeds, downSpeed: downSpeeds, ping: pings, wifiStr: wifiStrs, interrupts: interrupts};
  const labels = { upSpeed: 'Upload Speed (Mbps)', downSpeed: 'Downloadspeed (Mbps)', ping: 'Ping (ms)', wifiStr: 'WiFi Strength (%)', interrupt: 'Interrupts: 1=Interrupt, 0 = OK'};
  const borderColors = { upSpeed: 'blue', downSpeed: 'yellow', ping: 'green', wifiStr: 'orange', interrupts:'red'};

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
        stepped: mainMetric === 'interrupts'  //Binary look on graph..?
      }]
    },
    options: {
      scales: { 
        x: { 
          type: 'time', 
          time: {
            unit: range === 'month' ? 'day' : range === 'week' ? 'day' : 'hour',
            displayFormats: range === 'week'
            ? {day: 'MMM dd' }
            : { hour: 'HH:mm' }
          },
          min: start,  
          max: end             
        },
        y: {
          title: {
            display: true,
            text: range != 'day'            
              ? `${labels[mainMetric]} (Daily average)`
              : labels[mainMetric] },
          min:mainMetric === 'interrupts' ? -0.1: undefined,
          max:mainMetric === 'interrupts' ? 1.1: undefined,
          ticks: mainMetric === 'interrupts'
          ? {
            stepSize: 1,
            callback: value => {
              if (value === 0) return 'OK';
              if (value === 1) return 'Interrupt';
              return ''; // ← hide any other tick labels
            }
          }
          : {}
        },
              
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

function createInterruptArray(upSpeeds,downSpeeds,pings,wifiStrs){
  interrupts = [];
  const iterations = upSpeeds.length;
  const upDownSpeedLimit = 10;
  const wifiLimit = 60;
  const pingLimit = 30;

  for(let i = 0; i < iterations-1; i++){
    if(
      upSpeeds[i] < upDownSpeedLimit ||
      downSpeeds[i] < upDownSpeedLimit ||
      pings[i] > pingLimit ||
      wifiStrs[i] < wifiLimit
    ){
      interrupts.push(1);
    }
    else{
      interrupts.push(0);
    }    
  }    
  return interrupts;
}