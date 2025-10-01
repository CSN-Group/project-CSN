const os = require('os');
const testmngr = require('../database/dbManager.js');
const { contextBridge} = require('electron');

contextBridge.exposeInMainWorld('systemInfo', {	
	getStartTime: () => os.uptime(),
	getPcName: () => os.hostname()
});


contextBridge.exposeInMainWorld('dbManager', {
	getReadings: function(){
		return testmngr.getReadings()
	},	
	addReading: testmngr.addReading
});	