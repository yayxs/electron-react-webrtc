const { Menu, Tray, BrowserWindow, app } = require("electron");
const path = require("path");
const { commonUtils } = require(path.join(__dirname, "../utils/index"));
// 在主进程中
let iconTray = new Tray(path.join(__dirname,"../assets/favicon2.ico"));

// 菜单模板
const template = [
  {
    label: "设置",
    click() {
      console.log(`shezhi`);
    },
  },
  {
    label: "升级",
    click() {
      console.log(`shengji`);
    },
  },
  {
    label: "退出",
    click() {
      console.log(`tuichu`);
      if (process.platform !== 'darwin') {
        app.quit();
      }
    },
  },
];

const trayM = Menu.buildFromTemplate(template);
iconTray.setContextMenu(trayM);
iconTray.setToolTip("electron应用");
// 点击关闭按钮应用保存在托盘，双击托盘打开
let win = BrowserWindow.getFocusedWindow();
// 关闭事件
win.on("close", (e) => {
  if (!win.isFocused()) {
    win = null;
  } else {
    // 阻止默认事件
    commonUtils.stopDefault(e);
    win.hide();
  }
});

// 监听任务栏图标的点击事件
iconTray.on("double-click", () => {
  win.show();
});

// 图标闪烁
let co = 0;
let timerId = setInterval(() => {
  co++;
  if (co % 2 === 0) {
    iconTray.setImage(path.join(__dirname, "../assets/favicon2.ico"));
  } else {
    iconTray.setImage(path.join(__dirname, "../assets/empty.ico"));
  }
}, 500);
