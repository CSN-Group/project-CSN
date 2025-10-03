const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {execFile} = require('child_process');

ipcMain.handle('run-speedtest', async () => {
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
});

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
}

app.whenReady().then(createWindow);