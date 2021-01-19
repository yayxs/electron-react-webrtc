const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      nodeIntegration: true, // 开启nodejs 能力
    },
  })
  // 加载服务
  const path = isDev ? `http://localhost:3000` : ``
  win.loadURL(path)
  if (isDev) {
    win.webContents.openDevTools()
  }
}
app.commandLine.appendSwitch('--ignore-certificate-errors', 'true')
app.whenReady().then(createWindow)
/**
 * 尝试退出
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
/**
 * 首次启动或者重启
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
