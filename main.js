/*
 * @Author: your name
 * @Date: 2020-07-31 20:45:36
 * @LastEditTime: 2020-07-31 21:05:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \electron-learn\main.js
 */

const { app, BrowserWindow } = require("electron");

let mainWindow = null; // 主窗口
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    // 设置打开的窗口大小
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // 加载index.html文件  加载哪个页面
  mainWindow.loadFile("index.html");
  // 打开开发者工具
  // win.webContents.openDevTools();
}

// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
app.on("ready", () => {
  console.log(`ready`);
  createWindow();
});

//当所有窗口都被关闭后退出
app.on("window-all-closed", () => {
  console.log(`window-all-closed`);
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  console.log(`activate`);
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
