const os = require('os');
const dbManager = require('../database/dbManager.js');
const supaDbManager = require('../database/supabaseHandler.js');
const dgram = require('dgram');
const si = require('systeminformation')
const { contextBridge, ipcRenderer} = require('electron');
const { execSync } = require('child_process'); //allows to run shell /terminal commands 

contextBridge.exposeInMainWorld('systemInfo', {
	getGlobal: (key) => ipcRenderer.invoke('getGlobal', key),
	//setGlobals: () => setGlobals(),

	//Speedtest
	runSpeedtest: () => ipcRenderer.invoke('run-speedtest'),
});

contextBridge.exposeInMainWorld('dbManager', {
	getReadings: function(){
		return dbManager.getReadings()
	},	
	addReading: dbManager.addReading,	
	addSupaReading: supaDbManager.addReadingSupabase
});

contextBridge.exposeInMainWorld('updates', {
	onUpdateDone: (callback) => ipcRenderer.on('updateDone', callback),
	onActionsUpdated: (callback) => {
		ipcRenderer.on("updateActions", async (event, list) => {
			await callback(list);
		});
	}
});