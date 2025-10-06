const os = require('os');
const dbManager = require('../database/dbManager.js');
const supaDbManager = require('../database/supabaseHandler.js');
const dgram = require('dgram');
const si = require('systeminformation')
const { contextBridge, ipcRenderer} = require('electron');

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
	getOsVersion: () => os.version(),
	getOsVersion: () => process.getSystemVersion(),
	//getPcModel: () => `${os.type()} ${os.arch()}`, // Basic version
  	getUserName: () => os.userInfo().username,

	// Network functions
	getCurrentInterface: () => getCurrentInterface(),
	getInterfaceByIP: (ip) => getInterfaceByIP(ip),
	wifiConns: () => si.wifiConnections(),

	//Speedtest
	runSpeedtest: () => ipcRenderer.invoke('run-speedtest'),

	//Actions
	//updateActions: () => actions.updateActionList()
});

contextBridge.exposeInMainWorld('dbManager', {
	getReadings: function(){
		return dbManager.getReadings()
	},	
	addReading: dbManager.addReading,	
	addSupaReading: supaDbManager.addReadingSupabase
});