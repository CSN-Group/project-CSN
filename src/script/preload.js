const dbManager = require('../database/dbManager.js');
const supaDbManager = require('../database/supabaseHandler.js');
const { contextBridge, ipcRenderer} = require('electron');


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
	//convertToHourMin: (timestamps) => dbManager.convertToHourMin(timestamps), Not needed anymore?
	getDayReadings: (dateStamp) => dbManager.getDayReadings(dateStamp),
	getUniqueTimeStampsBefore: (limit) => dbManager.getUniqueTimeStampsBefore(limit),
	deleteAllReadings: () => dbManager.deleteAllReadings(),
	convertToDateStamp: (unix) => dbManager.convertToDateStamp(unix),
	summarizeDay: (dateStamp) => dbManager.summarizeDay(dateStamp),	
	addReading: dbManager.addReading,		
	addReadingSupabase:(avgUpSpeed, avgDownSpeed, avgPing, avgWifi, dateStamp) =>supaDbManager.addReadingSupabase(avgUpSpeed, avgDownSpeed, avgPing, avgWifi, dateStamp),
	fetchHistory: (myMac) => supaDbManager.fetchHistory(myMac),
});

contextBridge.exposeInMainWorld('updates', {
	onUpdateDone: (callback) => ipcRenderer.on('updateDone', callback),
	onActionsUpdated: (callback) => {
		ipcRenderer.on("updateActions", async (event, list) => {
			await callback(list);
		});
	}
});

contextBridge.exposeInMainWorld('nav', {
	detailedPage: (channel) => ipcRenderer.send('navigateDetailed'),
	simplePage: (channel) => ipcRenderer.send('navigateSimple')
});