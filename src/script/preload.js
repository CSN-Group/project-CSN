const os = require('os');
const dbManager = require('../database/dbManager.js');
const supaDbManager = require('../database/supabaseHandler.js');
const dgram = require('dgram');
const si = require('systeminformation')
const {globals, getGlobal, setGlobal} = require('../includes/variables');
const { contextBridge, ipcRenderer} = require('electron');
const { execSync } = require('child_process'); //smret

function getCurrentInterface() {
	return new Promise((resolve, reject) => {
		const socket = dgram.createSocket('udp4');

		//Try to connect to force routing
		socket.connect(1337, '8.8.8.8', () => {
			const address = socket.address().address;
			socket.close();

			//Find the matching IP among all interfaces
			const nets = os.networkInterfaces();
			for (const name of Object.keys(nets)) {
				for (const net of nets[name]) {
					if (net.family === 'IPv4' && net.address === address) {
						return resolve({ name, address });
					}
				}
			}

			//If no match, return null
			resolve({ name: null, address });
		});

		socket.on('error', reject);
	});
}

async function getInterfaceByIP(ip) {
	const interfaces = await si.networkInterfaces();

	// Find the interface that has the given IP
	const iface = interfaces.find(i => i.ip4 === ip);

	if (!iface) return null;
	else return { name: iface.iface, type: iface.type, operstate: iface.operstate };
}

contextBridge.exposeInMainWorld('systemInfo', {
	getStartTime: () => os.uptime(),
	getPcName: () => os.hostname(),
	// additional system information 
	//getOsVersion: () => os.version(),
	getOsVersion: () => process.getSystemVersion(),
	getPcModel: () => `${os.type()} ${os.arch()}`, // Basic version
  	getUserName: () => os.userInfo().username,
	//Check if update is avialable this returns a bool value 
  	
	checkForUpdates: () => {
    try {
        	// Use actual Windows Update COM objects (built into Windows)
        	const psCommand = `
            	$Session = New-Object -ComObject Microsoft.Update.Session
            	$Searcher = $Session.CreateUpdateSearcher()
            	$Result = $Searcher.Search("IsInstalled=0")
            	$Result.Updates.Count
        `	;
        
        	// Execute the proper PowerShell command
        	const result = execSync(`powershell -Command "${psCommand}"`, {stdio: 'pipe'}).toString();
        
        	// Convert result to number and check if > 0 (updates available)
        	return parseInt(result.trim()) > 0;
        
    	} catch (error) {
        	console.error('Error checking updates:', error);
        	return false;
    	}
	},
	
	//Get & sett all global variables
	//NOTE: Does not create a copy. If there's ever an issue with the variables,
	//that is probably the reason why.

	getGlobals: () => globals,
	setGlobals: () => setGlobals(),

	// Network functions
	getCurrentInterface,
	getInterfaceByIP,
	wifiConns: () => si.wifiConnections(),

	//Speedtest
	runSpeedtest: () => ipcRenderer.invoke('run-speedtest'),

	//Global variable RW
	//getGlobal: (key) => globals[key],
	//setGlobal: (key, value) => {globals[key] = value},
	getGlobal: (key) => getGlobal(key),
	setGlobal: (key, value) => setGlobal(key, value)
});

contextBridge.exposeInMainWorld('dbManager', {
	getReadings: function(){
		return dbManager.getReadings()
	},	
	addReading: dbManager.addReading,	
	addSupaReading: supaDbManager.addReadingSupabase
});	