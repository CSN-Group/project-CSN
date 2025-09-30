const os = require('os');
const { contextBridge} = require('electron');

contextBridge.exposeInMainWorld('systemInfo', {	
	getStartTime: () => os.uptime(),
	getPcName: () => os.hostname()
});