const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile('src/simpleView.html');
  //win.loadFile('src/script/initiateSimpleView.js'); //We want this function, how do we do it? Investigate -Jesper
}

app.whenReady().then(createWindow);