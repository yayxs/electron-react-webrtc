const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
app.on("ready", () => {
  // require("devtron").install();
  let mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  const path = isDev ? `http://localhost:3000` : ``;
  mainWindow.loadURL(path);
  mainWindow.webContents.openDevTools();
});
