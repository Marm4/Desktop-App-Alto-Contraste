const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const express = require('express');
const http = require('http');

let mainWindow;
let authWindow;
let proxyProcess;
let server;


/*require('electrtoon-reload')(path.join(__dirname, 'src'), {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});*/

function createWindow() {
  const iconPath = process.platform === 'win32'
  ? path.join(__dirname, 'assets/icons/ic_alto_contraste.ico') 
  : path.join(__dirname, 'assets/icons/ic_alto_contraste.png');

  mainWindow = new BrowserWindow({
    width: 490,
    height: 900,
    resizable: false,
    minWidth: 490, 
    maxWidth: 490,
    minHeight: 900,
    maxHeight: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: false
    },
    icon: iconPath
  });

  mainWindow.setMenu(null)
  mainWindow.loadFile('src/index.html');
  proxyProcess = fork(path.join(__dirname, 'proxy', 'server.js'));
 
}

function createAuthWindow(authUrl) {
  authWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  authWindow.loadURL(authUrl);

  authWindow.on('closed', () => {
    authWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Configurar el servidor express
  const expressApp = express();

  expressApp.get('/auth', (req, res) => {
    const authCode = req.query.code;
    mainWindow.webContents.send('auth-code-received', authCode);
    res.send('Authorization successful! You can close this window.');
  });

  server = http.createServer(expressApp);
  server.listen(3000, () => {
    console.log('Server listening on port 3000');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (proxyProcess) {
    proxyProcess.kill();
  }
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-auth-window', (event, authUrl) => {
  createAuthWindow(authUrl);
});

ipcMain.on('auth-code', (event, code) => {
  if (authWindow) {
    authWindow.close();
  }
  event.sender.send('auth-code-received', code);
});

ipcMain.on('navigate-to', (event, view) => {
  const viewPath = path.join(__dirname, view);
  mainWindow.loadFile(viewPath);
});

ipcMain.on('go-back', () => {
  mainWindow.webContents.goBack();
});