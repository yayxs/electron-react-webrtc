const path = require("path");
const { app, BrowserWindow } = require("electron");
const utils = require(path.join(__dirname, "../utils/utils"));
const { mainWindow, MainHandle } = require(path.join(
  __dirname,
  "./main.handle.js"
));

const _MainHandle = new MainHandle(); // 实例化主要handle
/**
 * docs https://www.electronjs.org/docs/api/app#apprequestsingleinstancelock
 * 应用程序实例是否成功取得了锁
 * 取得锁失败：假设另一个应用实例取得了锁仍旧在运行
 * 然后立即退出 它应该立刻退出，并且将参数发送给那个已经取到锁的进程
 */

const isGetInsLock = app.requestSingleInstanceLock();

if (!isGetInsLock) {
  app.quit(); // 立即退出
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) myWindow.restore();
      mainWindow.focus();
    }
  });
  // 创建 myWindow, 加载应用的其余部分, etc...
  app.on("ready", () => {
    // electron 完成后开始创建窗口
    _MainHandle.createMain(); // 创建主窗口
  });

  //当所有窗口都被关闭后退出
  app.on("window-all-closed", () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (!utils.isMacOS) {
      app.quit();
    }
  });
  app.on("activate", () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) {
      _MainHandle.createWindow();
    }
  });
}
