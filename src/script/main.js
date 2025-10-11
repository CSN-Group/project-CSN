const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const {execFile, exec} = require('child_process');
const {addReading} = require('../database/dbManager.js')


const util = require('util');
const execProm = util.promisify(exec);

const os = require('os');
const dgram = require('dgram');

//Local variables
let updateCounter = 0;
let currentlyUpdating = false;
const updateInterval = 1000; //ms
const dbSaveInterval = 600;

let globalsUpdated = false;
let initialUpdateCheck = false;

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
  updatesAvailable: null,
  mac: null,

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
  const list = [];

  if (globals['currentIP'] !== "No valid IP") {
    list.push("You have a valid IP!");
  }

  return list;
}

//Network functions
async function updateCurrentInterface() {
  return new Promise((resolve) => {
    try {
      const socket = dgram.createSocket('udp4');

      socket.on('error', (err) => {
        console.error('Socket error in updateCurrentInterface:', err);
        socket.close();
        resolve({ address: null, name: null });
      });

      socket.connect(1337, '8.8.8.8', () => {
        let address = null;
        if (socket.address() && socket.address().address) {
          address = socket.address().address;
        }
        socket.close();

        let name = null;

        if (address) {
          try {
            const nets = os.networkInterfaces();
            for (const ifaceName of Object.keys(nets)) {
              for (const net of nets[ifaceName]) {
                if (net.family === 'IPv4' && net.address === address) {
                  name = ifaceName;
                  break;
                }
              }
              if (name) break;
            }
          } catch (err) {
            console.error('Error while reading network interfaces:', err);
          }
        }

        resolve({ address, name });
      });
    } catch (err) {
      console.error('Unexpected error in updateCurrentInterface:', err);
      resolve({ address: null, name: null });
    }
  });
}

async function getInterfaceByIP(ip) {
  if (!ip) throw new Error("IP address is required.");

  const psScript = `
$results = @()
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=TRUE" | ForEach-Object {
    $adapter = $null
    try {
        $adapter = Get-CimInstance -Namespace root/StandardCimv2 -ClassName MSFT_NetAdapter -Filter "InterfaceIndex=$($_.InterfaceIndex)" -ErrorAction Stop
    } catch {
        $adapter = Get-CimInstance Win32_NetworkAdapter -Filter "InterfaceIndex=$($_.InterfaceIndex)" -ErrorAction SilentlyContinue
    }
    $ifType = $adapter.ifType
    if (-not $ifType -and $adapter.InterfaceType) { $ifType = $adapter.InterfaceType }

    foreach ($addr in $_.IPAddress) {
        if ($addr -match '^\\d+\\.\\d+\\.\\d+\\.\\d+$') {
            $results += [PSCustomObject]@{
                Name = $adapter.NetConnectionID
                IPv4 = $addr
                IfType = $ifType
                mac = $_.MACAddress
            }
        }
    }
}
$match = $results | Where-Object { $_.IPv4 -eq '${ip}' }
if ($match) { $match | ConvertTo-Json -Compress } else { $null | ConvertTo-Json }
`;

  // Encode to base64 to safely pass multi-line script
  const psBase64 = Buffer.from(psScript, 'utf16le').toString('base64');

  const { stdout } = await execProm(`powershell -NoProfile -EncodedCommand ${psBase64}`);

  if (!stdout.trim() || stdout.trim() === "null") return null;
  return JSON.parse(stdout);
}

async function getWifiInfo() {
  try {
    const { stdout } = await execProm("netsh wlan show interfaces");
    const ssidMatch = stdout.match(/^\s*SSID\s*:\s*(.+)$/m);
    const signalMatch = stdout.match(/^\s*Signal\s*:\s*(\d+)%/m);

    if (!ssidMatch || !signalMatch) return null;

    return {
      ssid: ssidMatch[1].trim(),
      strength: parseInt(signalMatch[1], 10)
    };
  } catch (err) {
    return null;
  }
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

//Update
async function measureSystem() {
  //Find used IP and interface
  const ifaceInfo = await updateCurrentInterface();

  if(ifaceInfo.address !== null && ifaceInfo.address !== "0.0.0.0") setGlobal('currentIP', ifaceInfo.address);
  else setGlobal('currentIP', "No valid IP");

  //Find connection type
  const ifaceType = await getInterfaceByIP(ifaceInfo.address);

  if(ifaceType !== null) {
    setGlobal('currentConnectionType', ifCodeToType(ifaceType.IfType));
    setGlobal('mac', ifaceType.mac);
  }
  else setGlobal('currentConnectionType', "None");

  //If WiFi, get strength
  if(getGlobal('currentConnectionType') === "WiFi") {
    const wifiInfo = await getWifiInfo();

    if (wifiInfo !== null) setGlobal('currentWifiStrength', wifiInfo.strength);
    else setGlobal('currentWifiStrength', 0);
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
          //Do something even it speedtest fails?
        });
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

    //Every now and then, save values to database
    if(updateCounter % dbSaveInterval === 0){

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
    setInterval(runFullUpdate, updateInterval);
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});