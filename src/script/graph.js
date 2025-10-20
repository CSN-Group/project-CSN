
let graph = null;

let currentGraphMetric = 'upSpeed';
let currentGraphDatestamp = dbManager.convertToDateStamp(new Date().getTime());
let currentGraphRange = 'day';
let currentGraphYear = 2025; //Because why not.
let currentGraphMonth = 10 //Hardcoded, but can be found with Date()! If time we make nice.


async function initDrop(){
  const dayDrop = document.getElementById("dayDropdown");
  const weekDrop = document.getElementById("weekDropdown");
  const monthDrop = document.getElementById("monthDropdown");  

  const days = dbManager.getUniqueDateStamps();
  const months = await dbManager.fetchAvailableMonths();
 
  days.forEach(day => {
    const button = document.createElement("button");
    button.textContent = day;
    button.addEventListener("click", () => {
      currentGraphDatestamp = day;
      currentGraphRange = 'day';
      createDayGraph(currentGraphDatestamp, currentGraphMetric);
    });
    dayDrop.appendChild(button);
  });

  const weekButton = document.createElement("button");
  weekButton.textContent = "Last 7 days";
  weekButton.addEventListener("click", () => {
    currentGraphRange = 'week';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange);
  })
  weekDrop.appendChild(weekButton);

  months.forEach(month => {
    const button = document.createElement("button");    
    button.textContent = month.month;
    button.addEventListener("click", () => {
      currentGraphRange = 'month';
      currentGraphMonth = parseInt(month.month);
      currentGraphYear = month.year;   
      createDayGraph(currentGraphDatestamp, currentGraphMetric, 'month', currentGraphYear,currentGraphMonth);
    });
    monthDrop.append(button);
  });  
}

async function initGraph(){
  //Databasestuff! Move somewhere else?
  dbManager.syncLocalDatabase();   
  dbManager.cleanLocalDatabase(); 
  createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  
  document.getElementById('graphPingButton').addEventListener('click', () =>{
    currentGraphMetric = 'ping';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  });

  document.getElementById('graphUpspeedButton').addEventListener('click', () =>{
    currentGraphMetric = 'upSpeed';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  } );

  document.getElementById('graphDownspeedButton').addEventListener('click', () =>{
    currentGraphMetric = 'downSpeed';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  } );

  document.getElementById('graphWifiButton').addEventListener('click', () =>{
    currentGraphMetric = 'wifiStr';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  } );

  document.getElementById('graphInterruptButton').addEventListener('click', () =>{
    currentGraphMetric = 'interrupts';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  });

  document.getElementById('graphWorktimeButton').addEventListener('click', () =>{
    currentGraphMetric = 'workingTime';
    createDayGraph(currentGraphDatestamp, currentGraphMetric, currentGraphRange,currentGraphYear,currentGraphMonth);
  });
    
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
async function createDayGraph(dateStamp, mainMetric, range = "day", year=2025, month=10){
  const graphContainer = document.getElementById('historyGraph');
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
    const currentMonth = (new Date().getMonth()+1);
     
    if(month === currentMonth){ //If we want to plot the current month, the last week is not in Supabase!
      const datestamps = dbManager.getUniqueDateStamps();      
      datestamps.forEach( stamp => {
        readings.push(dbManager.summarizeDay(stamp));
      })     
    }    
  }
  else{    
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
  let interrupts;
  let workingTime;
  if(mainMetric === 'interrupts'){interrupts = createInterruptArray(upSpeeds,downSpeeds,pings,wifiStrs);} 
  if(mainMetric === 'workingTime'){
    const workSessions = dbManager.getActiveSessions(dateStamp);
    //console.log(workSessions) 
    workingTime = createWorktimeData(workSessions);
  }
  //console.log(workingTime);
  const start = times[0];
  const end = times[times.length-1]
  
  const metrics = { upSpeed: upSpeeds, downSpeed: downSpeeds,
                    ping: pings, wifiStr: wifiStrs, interrupts: interrupts, workingTime: workingTime};
  const labels = { upSpeed: 'Upload Speed (Mbps)', downSpeed: 'Downloadspeed (Mbps)', ping: 'Ping (ms)',
                   wifiStr: 'WiFi Strength (%)', interrupts: 'Interrupts', workingTime:'Work or Not'};
  const borderColors = { upSpeed: 'blue', downSpeed: 'yellow', ping: 'green', wifiStr: 'orange', interrupts:'red', workingTime: 'purple'};
  const titleText = {upSpeed:"Uppladdningshastighet" , downSpeed:"Nedladdningshastighet", ping:"Ping", wifiStr:"Wifi", interrupts:"Interrupts", workingTime:"Arbetstid",}

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
        stepped: mainMetric === 'interrupts' || mainMetric === 'workingTime'  //Binary look on graph..?
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
          min:mainMetric === 'interrupts' || mainMetric === 'workingTime' ? -0.1: undefined,
          max:mainMetric === 'interrupts' || mainMetric === 'workingTime' ? 1.1: undefined,
          ticks: mainMetric === 'interrupts' || mainMetric === 'workingTime'
          ? {
            stepSize: 1,
            callback: value => {
              if (value === 0) return mainMetric === 'workingTime' ? 'Idle': 'OK';
              if (value === 1) return mainMetric === 'workingTime' ? 'Working':'Interrupt';
              return ''; // ← hide any other tick labels
            }
          }
          :{}
        },
              
      },
      plugins: {
        legend: { display: false },
        title: { display: true,
                 text: titleText[mainMetric],
                 font: { size: 14 } },
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
        const order = ['wifiStr', 'downSpeed','upSpeed', 'ping'].filter(k => k !== mainMetric);
        return [tooltipLines[mainMetric], ...order.map(k => tooltipLines[k])].filter(Boolean); //Filter Boolean removes undefined number on interrupt and workingtime.
          }
          }
        }
      }
      }
  });
}

function createInterruptArray(upSpeeds,downSpeeds,pings,wifiStrs){
  let interrupts = [];
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

function createWorktimeData(sessions) {  
  let data = [];
  sessions.forEach(session => {
    data.push({ x: session.startTime, y: 1 });
    data.push({ x: session.stopTime, y: 1 });
    data.push({ x: session.stopTime + 1, y: 0 });
  });
  return data;
}

//module.exports = {initDrop, initGraph };