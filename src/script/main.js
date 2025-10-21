const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const path = require('path');
const network = require('../mainincludes/network.js');
const si = require('systeminformation');
const fs = require('fs');

const {execFile, exec} = require('child_process');
const {addReading,addActiveTime} = require('../database/dbManager.js')

const util = require('util');
const execProm = util.promisify(exec);

async function isUsingBattery() {
  const bat = await si.battery();

  if (!bat.hasBattery) return false;
  if (!bat.isCharging) return true;
  if (bat.percent < 100 && bat.timeRemaining > 0) return true;
  else return false;
}

const os = require('os');
const dgram = require('dgram');
const { glob } = require('fs');
const {isInterfaceActive} = require("../mainincludes/network");

//Constants
const UPDATE_INTERVAL = 1000; //ms
const STANDARD_SLEEP_INTERVAL = 30 * 60 * 1000;
const ALLOWED_DOWNTIME_DURATION_SECONDS = 300;
const ALLOWED_DOWNTIME_DURATION_MILLIS = ALLOWED_DOWNTIME_DURATION_SECONDS * 1000;

//Local variables
let updateCounter = 0;
let currentlyUpdating = false;

let globalsUpdated = false;
let initialUpdateCheck = false;
let updateLoopRunning = false;
let isStarted = false;

let dismissedActions = [];

//Globals
const globals = {
  //Network
  currentIP: "No valid IP",
  currentConnectionType: "Checking...",
  currentlySpeedtesting: false,
  currentWifiStrength: 0,
  speedtestText: "INGEN MÄTNING",

  //System information
  compOnTimeHours: 0,
  pcName: "Loading..",
  osVersion: "Loading..",
  pcModel: "Loading..",
  userName: "Loading..",
  updatesAvailable: null,
  mac: null,
  usingBattery: false,

  //Activity
  currentlyPausing: false,
  userActiveStartTime: Date.now(),

  //Last speedtest
  lastDownspeed: 0.0,
  lastUpspeed: 0.0,
  lastPing: 0,

  //Settings
  shouldSaveData: true,
  shouldMeasure: true,
  remindErgonomi: true,
  remindSocial: true,
  
  //Thresholds
  downHighTresh: 30,
  downLowTresh: 10,
  upHighTresh: 15,
  upLowTresh: 5,
  wifiHighTresh: 90,
  wifiLowTresh: 70,
  pingHighTresh: 30,
  pingLowTresh: 15,

  //Local data
  dataSavedAmount: 0,
}

//Globals functions
function getGlobal(key){
  if (key in globals) {
    return globals[key];
  } else {
    throw new Error(`Global key "${key}" does not exist.`);
  }
}

function setGlobal(key, value){
  if (!(key in globals)) {
    throw new Error(`Global key "${key}" does not exist.`);
  }

  const oldValue = globals[key];
  if (oldValue !== value){
    globals[key] = value;
    globalsUpdated = true;
  }
}

// General functions
function ifCodeToType(ifCode) {
    switch (ifCode){
      case 6: return "Ethernet";
      case 71: return "WiFi";
      case 23: return "PPP";
      case 24: return "Loopback";
      case 131: return "Tunnel (VPN)";
      case 243: return "USB Network Adapter";
      case 281: return "Cellular (legacy)";
      case 282: return "LTE / 5G";
      default: return "Unknown, code: " + ifCode;
    }
}

//Actions
function generateActionList() {
  updateDismissedList();
  const list = [];
  let allValuesGood = true;

  // TEST //
  //if(globals['currentIP'] !== "No valid IP" && !isDismissed("valid-ip")){
  //  list.push(createAction("valid-ip", "notice", "Din har en godkänd IP address.", true, 5000))
  //}
  // END TEST //

  //Tech Actions
  if(globals['currentWifiStrength'] < globals['wifiHighTresh'] && globals['currentWifiStrength'] > globals['wifiLowTresh'] ){
    list.push(createAction("wifi-medium", "light-error", "Din wifisingal är ganska låg."));
    allValuesGood = false;
  }
  else if(globals['currentWifiStrength'] < globals['wifiLowTresh']){
    list.push(createAction("wifi-low", "error", "Din wifisingal är väldigt låg!"));
    allValuesGood = false;
  }  
  
  if(globals['lastUpspeed'] > globals['upDownLowTresh'] && globals['lastUpspeed'] < globals['upDownHighTresh']){
    list.push(createAction("up-medium", "light-error", "Din uppladdningshastighet är ganska låg."));
    allValuesGood = false;
  }
  else if(globals['lastUpspeed'] < globals['upDownLowTresh']){
    list.push(createAction("up-low", "error", "Din uppladdningshastighet är väldigt låg!"));
    allValuesGood = false;
  }
  
  if(globals['lastDownspeed'] > globals['upDownLowTresh'] && globals['lastDownspeed'] < globals['upDownHighTresh']){
    list.push(createAction("down-high", "light-error", "Din nedladdningshastighet är ganska låg."));
    allValuesGood = false;
  }
  else if(globals['lastDownspeed'] < globals['upDownLowTresh']){
    list.push(createAction("down-low", "error", "Din nedladdnignshastighet är väldigt låg!"));
    allValuesGood = false;
  }
  
  if(globals['lastPing'] < globals['pingHighTresh'] && globals['lastPing'] > globals['pingLowTresh']){
    list.push(createAction("ping-medium", "light-error", "Din nedladdningshastighet är ganska låg."));
    allValuesGood = false;
  }
  else if(globals['lastPing'] > globals['pingHighTresh']){
    list.push(createAction("ping-high", "error", "Din svarstid är väldigt hög!"));
    allValuesGood = false;
  }

  if(allValuesGood){
    list.push(createAction("all-good", "notice", "Fina värden! Skutan bör segla utan problem!"));
  }

  if(globals['currentIP'] === "No valid IP"){
    list.push(createAction("invalid-ip", "error", "Din IP kanske inte är kopplad via en router."));
  }

  if(globals['usingBattery']){
    list.push(createAction("using-battery", "notice", "Anslut laddaren"));
  }

  if(globals['compOnTimeHours'] > 4){
    list.push(createAction("comp-hour", "light-error", "Datorn har varit igång länge, testa omstart"));
  }

  if(globals['currentConnectionType'] != "Ethernet"){
    list.push(createAction("conn-type", "notice", "Koppla in internetkabel för stabilare internet."));
  }
  
  if(globals['updatesAvailable']){    
    list.push(createAction("update-available", "light-error", "Windowsuppdatering tillgänglig!"));
  }

  //Soft Actions
  if( (Date.now() - globals['userActiveStartTime']) > 1800000){
    list.push(createAction("ergonomy", "notice", "Byt sittposition",true,30, false));
  }
  



  return list;
}

function createAction(id, severity, text,
                      dismissable = false,
                      sleepDuration = 0,
                      isTechnical = true)
{
  return {
    id,
    severity,
    text,
    dismissable,
    sleepDuration,
    isTechnical
  };
}

function createDismissedAction(id, sleepDuration, dismissTimestamp){
  return{
    id,
    sleepDuration,
    dismissTimestamp
  }
}

function updateDismissedList() {
  const now = Date.now();
  dismissedActions = dismissedActions.filter(
      item => now < item.dismissTimestamp + item.sleepDuration
  );
}

function isDismissed(id){
  return dismissedActions.some(obj => obj.id === id);
}
function dismissAction(id, sleepDuration = STANDARD_SLEEP_INTERVAL){
  if(!isDismissed(id)) dismissedActions.push(createDismissedAction(id, sleepDuration, Date.now()));
}

async function runSpeedtest(){
  return new Promise((resolve, reject) => {

    const binaryPath = app.isPackaged
        ? path.join(process.resourcesPath, 'bin', 'speedtest.exe')
        : path.join(__dirname, '..', '..', 'bin', 'speedtest.exe');

    execFile(binaryPath,
        ['--accept-license',
          '--accept-gdpr',
          '--format=json'],
        (error, stdout, stderr) => {
          if (error) return reject(error);

          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            reject(e);
          }
        });
  });
}

async function performSpeedtest(triggeredBy = 'main') {
  const currentlyTesting = getGlobal('currentlySpeedtesting');

  if(!currentlyTesting && globals["shouldMeasure"]){
    setGlobal('currentlySpeedtesting', true);
    setGlobal('speedtestText', "Testar...");

    setGlobal("lastDownspeed", "testing..");
    setGlobal("lastUpspeed", "testing..");
    setGlobal("lastPing", "testing..");

    const result = await runSpeedtest();

    const speedInfo = {
      download: result.download.bandwidth / 1000000,
      upload: result.upload.bandwidth / 1000000,
      ping: result.ping.latency
    };

    if (speedInfo) {
      const downSpeed = (speedInfo.download * 8).toFixed(1);
      const upSpeed = (speedInfo.upload * 8).toFixed(1);
      const ping = speedInfo.ping.toFixed(0);

      setGlobal("lastDownspeed", downSpeed);
      setGlobal("lastUpspeed", upSpeed);
      setGlobal("lastPing", ping);
      setGlobal('speedtestText', Date.now());
    } else setGlobal('speedtestText', "ERROR");

    setGlobal('currentlySpeedtesting', false)
  }
}

async function logReading() {
  try {
    return addReading(
        getGlobal('lastUpspeed'),
        getGlobal('lastDownspeed'),
        getGlobal('currentWifiStrength'),
        getGlobal('lastPing'),
        getGlobal('currentConnectionType'));
  } catch (err) {
    console.error('[AutoLogger] Failed to log reading:', err);
  }
}


//System functions
async function isUpdatesAvailable(){
  try {
    const { spawn } = require('child_process');
    const psCommand = `try { (New-Object -ComObject Microsoft.Update.Session).CreateUpdateSearcher().Search('IsInstalled=0').Updates.Count } catch { 0 }`;

    return new Promise((resolve) => {
      const ps = spawn('powershell', [
        '-ExecutionPolicy', 'Bypass',
        '-Command', psCommand
      ]);

      let output = '';
      const timeout = setTimeout(() => { ps.kill(); resolve(false); }, 30000);

      ps.stdout.on('data', (data) => output += data.toString());
      ps.on('close', () => {
        clearTimeout(timeout);
        const updateCount = parseInt(output.trim());
        resolve(!isNaN(updateCount) && updateCount > 0);
      });

      ps.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });

  } catch (error) {
    return false;
  }

}

//Data used
async function getDataUsed() {
  try {
    const stats = await fs.promises.stat("src/database/database.db");
    return stats.size;
  } catch (err) {
    console.error(`Error getting file size for database.db:`, err);
    throw err;
  }
}
//IPC
ipcMain.handle('run-speedtest', async () => performSpeedtest('renderer'));
ipcMain.handle('getGlobal', (event, key) => getGlobal(key));
ipcMain.handle('setGlobal', (event, key, value) => setGlobal(key, value));
ipcMain.handle("getList", () => {
  return generateList();
});

ipcMain.on("dismiss-action", (event, { id, sleepDuration }) => {
  dismissAction(id, sleepDuration);
});

ipcMain.on('navigateDetailed', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.loadFile("src/detailedView.html");
});

ipcMain.on('navigateSimple', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.loadFile("src/simpleView.html");
});

//Events
function updateDoneEvent() {
  BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send('updateDone')
  );
}

function updateActionEvent(){
  BrowserWindow.getAllWindows().forEach(win =>
      win.webContents.send("updateActions", generateActionList())
  );
}

//Activity
function startActivePeriod(){
  globals["currentlyPausing"] = false;
  globals['userActiveStartTime'] = Date.now();
}

function saveActivityToDatabase(start, stop){
  //Sparar data varje dag, det är roligt.
  //Massa data vill man ha, mycket troligt!
  //För då kan man plotta
  //En graf eller åtta!
  //Databaser! Wioooo!
  //(Ducktales)
  const totalMin = (stop - start) / 60000;
  if(totalMin > 0){
    addActiveTime(start,stop,totalMin);
  }  
}

//Update
async function measureSystem() {
  //Battery
  if(updateCounter % 60 === 0) setGlobal('usingBattery', await isUsingBattery());

  //Find used IP and interface
  const ifaceInfo = await network.updateCurrentInterface();

  if(ifaceInfo.address !== null &&
     ifaceInfo.address !== "0.0.0.0" &&
     isInterfaceActive(ifaceInfo.address)) setGlobal('currentIP', ifaceInfo.address);
  else setGlobal('currentIP', "No valid IP");

  //Find connection type
  const ifaceType = await network.getInterfaceByIP(ifaceInfo.address);

  if(ifaceType !== null) {
    setGlobal('currentConnectionType', ifCodeToType(ifaceType.IfType));
    setGlobal('mac', ifaceType.mac);
  }
  else setGlobal('currentConnectionType', "None");

  //If WiFi, get strength
  if(getGlobal('currentConnectionType') === "WiFi") {
    const wifiInfo = await network.getWifiInfo();

    if (wifiInfo !== null) setGlobal('currentWifiStrength', wifiInfo.strength);
    else setGlobal('currentWifiStrength', 0);
  } else setGlobal('currentWifiStrength', 0);

  //User activity
  const userIdleTime = powerMonitor.getSystemIdleTime();

  if(userIdleTime > ALLOWED_DOWNTIME_DURATION_SECONDS && !globals['currentlyPausing']){
    setGlobal('currentlyPausing', true);
    
    // Dessa bildar ett tidsspann för en aktiv tid.
    console.log("ABOUT TO ADD")
    
    saveActivityToDatabase(globals["userActiveStartTime"], Date.now()-ALLOWED_DOWNTIME_DURATION_MILLIS);
  } else if(userIdleTime < ALLOWED_DOWNTIME_DURATION_SECONDS && globals["currentlyPausing"]){
    startActivePeriod();
  }

  //Data usage
  if(updateCounter % 60 === 0){
    globals['dataSavedAmount'] = await getDataUsed();
  }

  //OS Uptime
  if(updateCounter % 60 === 0){
    //Uptime
    setGlobal('compOnTimeHours',
       Math.floor(os.uptime() / 3600)); //Converting from seconds to hours      
  

    //Systeminfo
    setGlobal('pcName', os.hostname());
    setGlobal('osVersion', os.release());
    setGlobal('pcModel', `${os.type()} ${os.arch()}`);
    setGlobal('userName', os.userInfo().username);
  }

  //Database logging here
  if(updateCounter % 600 === 0){
    performSpeedtest('main')
        .then(logReading)
        .catch(() => setGlobal('updatesAvailable', false));
  }

  if(updateCounter % 3600 === 0){
    isUpdatesAvailable()
        .then(updatesAvailable => setGlobal('updatesAvailable', updatesAvailable))
        .catch(() => setGlobal('updatesAvailable', false));
  }

  updateCounter++;
}

async function runFullUpdate() {
  if (currentlyUpdating) return;

  currentlyUpdating = true;

  try {
    await measureSystem();    

    //Tell renderer that update is done
    updateDoneEvent();

    //If globals are updated, update action list
    if(globalsUpdated){
      globalsUpdated = false;
      BrowserWindow.getAllWindows().forEach(win =>
          win.webContents.send("updateActions", generateActionList())
      );
    }
  } finally {
    currentlyUpdating = false;
  }
}

//Create window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile('src/simpleView.html');

  win.webContents.on('did-finish-load', () => {
    if(!updateLoopRunning){
      updateLoopRunning = true;
      setInterval(runFullUpdate, UPDATE_INTERVAL);
    }

    if(!isStarted) isStarted = true;
    else if(isStarted) updateActionEvent();
  });
}

app.whenReady().then(() => {
  createWindow();

  powerMonitor.on('suspend', () => {
    if(!globals['currentlyPausing']) saveActivityToDatabase(globals['userActiveStartTime'], Date.now()-ALLOWED_DOWNTIME_DURATION_MILLIS);
  });

  powerMonitor.on('resume', () => {
    startActivePeriod();
  });

  powerMonitor.on('on-ac', () => {
    setGlobal('usingBattery', false);
  });

  powerMonitor.on('on-battery', () => {
    setGlobal('usingBattery', true);
  });

  powerMonitor.on('shutdown', (e) => {
    if(!globals['currentlyPausing']) saveActivityToDatabase(globals['userActiveStartTime'], Date.now()-ALLOWED_DOWNTIME_DURATION_MILLIS);
  });
});

app.on('window-all-closed', () => {
  if(!globals['currentlyPausing']) saveActivityToDatabase(globals['userActiveStartTime'], Date.now()-ALLOWED_DOWNTIME_DURATION_MILLIS);
  app.quit();
});

//SLUT