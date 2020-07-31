const path = require("path");
const { app, BrowserWindow } = require("electron");
const { utils } = require(path.join(__dirname, "../utils/utils"));
let mainWindow = null; // 主要窗口默认空

class NewInstance {
  constructor() {}
  // 创建窗口
  createWindow(options) {
    const { width = 400, height = 400 } = options;
    return new BrowserWindow({
      width,
      height,
      // webPreferences: {
      //   preload: path.join(__dirname, "preload.js"),
      // },
    });
  }
}
class MainHandle extends NewInstance {
  constructor(options) {
    super(options);
  }
  // 创建主窗口
  createMain() {
    const _opts = {
      width: 400,
      height: 300,
    };
    mainWindow = super.createWindow(_option);
    // 加载index.html文件
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    if (utils.isDebug) {
      // 如果是调试模式打开控制台
      mainWindow.webContents.openDevTools();
    }
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
}

module.exports = {
  mainWindow, // 主窗口
  MainHandle, //
};
