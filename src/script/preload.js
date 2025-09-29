const os = require('os');
const { contextBridge} = require('electron');

const uptimeInSeconds = os.uptime();

contextBridge.exposeInMainWorld('systemInfo', {	
	getStartTime: () => uptimeInSeconds
});