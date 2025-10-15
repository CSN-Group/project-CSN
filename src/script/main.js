const { app, BrowserWindow, ipcMain, powerMonitor } = require('electron');
const path = require('path');
const network = require('../mainincludes/network.js');
const si = require('systeminformation');

const {execFile, exec} = require('child_process');
const {addReading} = require('../database/dbManager.js')

const util = require('util');
const execProm = util.promisify(exec);

const os = require('os');
const dgram = require('dgram');

//Constants
const UPDATE_INTERVAL = 1000; //ms
const DB_SAVE_INTERVAL = 600; // * updateInterval
const STANDARD_SLEEP_INTERVAL = 30 * 60 * 1000;
const ALLOWED_DOWNTIME_DURATION = 50 * 1000;

//Local variables
let updateCounter = 0;
let currentlyUpdating = false;

let globalsUpdated = false;
let initialUpdateCheck = false;
let updateLoopRunning = false;

let dismissedActions = [];

//Globals
const globals = {
  //Network
  currentIP: "No valid IP",
  currentConnectionType: "Checking...",
  currentlySpeedtesting: false,
  currentWifiStrength: 0,

  //System information
  compOnTimeHours: 0,
  pcName: "Loading..",
  osVersion: "Loading..",
  pcModel: "Loading..",
  userName: "Loading..",
  updatesAvailable: "Loading..",
  mac: null,
  usingBattery: si.battery(),

  //Activity
  currentlyPausing: false,
  userActiveStartTime: Date.now(),

  //Last speedtest
  lastDownspeed: 0.0,
  lastUpspeed: 0.0,
  lastPing: 0
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


  // TEST //

  if(globals['currentIP'] !== "No valid IP" && !isDismissed("valid-ip")){
    list.push(createAction("valid-ip", "check", "You have a valid IP!!!", true, 5000))
  }

  // END TEST //

  if(globals['currentIP'] === "No valid IP"){
    list.push(createAction("invalid-ip", "error", "No valid IP"));
  }

  if(globals['usingBattery']){
    list.push(createAction("using-battery", "error", "ANSLUT LADDARE DIN DÅRE!!!"));
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

  if(!currentlyTesting) {
    setGlobal('currentlySpeedtesting', true);

    setGlobal("lastDownspeed", "testing..");
    setGlobal("lastUpspeed", "testing..");
    setGlobal("lastPing", "testing..");

    updateDoneEvent();

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
    }

    if (triggeredBy === 'renderer') {
      updateDoneEvent();
    }

    setGlobal('currentlySpeedtesting', false)
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

//Activity
function startActivePeriod(){
  globals["currentlyPausing"] = false;
  globals['userActiveStartTime'] = Date.now();
}

function saveActivityToDatabase(start, stop){
  //Woooo spara till db
}

//Update
async function measureSystem() {
  //Find used IP and interface
  const ifaceInfo = await network.updateCurrentInterface();

  if(ifaceInfo.address !== null && ifaceInfo.address !== "0.0.0.0") setGlobal('currentIP', ifaceInfo.address);
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
  }

  //User activity
  const userIdleTime = powerMonitor.getSystemIdleTime();

  if(userIdleTime > ALLOWED_DOWNTIME_DURATION && !globals['currentlyPausing']){
    setGlobal('currentlyPausing', true);
    //
    // Spara till DB - starttid (Timestamp) och stopptid (Timestamp)
    // Dessa bildar ett tidsspann för en aktiv tid.
    //
    saveActivityToDB(globals["userActiveStartTime"], Date.now());
  } else if(userIdleTime < ALLOWED_DOWNTIME_DURATION && globals["currentlyPausing"]){
    startActivePeriod();
  }

  //OS Uptime
  if(updateCounter % 60 === 0){
    //Uptime
    setGlobal('compOnTimeHours', os.uptime());

    //Systeminfo
    setGlobal('pcName', os.hostname());
    setGlobal('osVersion', os.release());
    setGlobal('pcModel', `${os.type()} ${os.arch()}`);
    setGlobal('userName', os.userInfo().username);
  }

  //Database logging here
  if(updateCounter % 600 === 0){
     performSpeedtest()
        .then(() => {
          //logInDB();
        })
        .catch(err => {
          console.error('Speedtest failed:', err);
          //Do something even if speedtest fails?
        });
  }

  if(updateCounter % 3600 === 0){
    isUpdatesAvailable()
        .then(updatesAvailable => setGlobal('updatesAvailable', updatesAvailable))
        .catch(() => setGlobal('updatesAvailable', false));
  }

  updateCounter++;
  console.log(updateCounter);
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
    height: 600,
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
  });
}

app.whenReady().then(() => {
  createWindow();

  powerMonitor.on('suspend', () => {
    if(!globals['currentlyPausing']) saveActivityToDatabase(globals['userActiveStartTime']);
  });

  powerMonitor.on('resume', () => {
    startActivePeriod();
    console.log('System has resumed from sleep');
  });

  powerMonitor.on('on-ac', () => {
    setGlobal('usingBattery', false);
  });

  powerMonitor.on('on-battery', () => {
    setGlobal('usingBattery', true);
  });

  powerMonitor.on('shutdown', (e) => {
    if(!globals['currentlyPausing']) saveActivityToDatabase(globals['userActiveStartTime']);
  });
});

app.on('window-all-closed', () => {
  app.quit();
});