const os = require('os');
const { contextBridge} = require('electron');

contextBridge.exposeInMainWorld('systemInfo', {	
	getStartTime: () => os.uptime(),
	getPcName: () => os.hostname(),
	// additional system information 
	getOsVersion: () => os.version(),
	getPcModel: () => `${os.type()} ${os.arch()}`, // Basic version
    getUserName: () => os.userInfo().username,
});