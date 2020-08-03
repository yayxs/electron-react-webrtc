let { Menu, Tray, BrowserWindow, app } = require("electron");

let path = require("path");

let iconTray = new Tray(path.join(__dirname, "../assets/favicon2.ico"));

//绑定右键菜单

let trayMenu = Menu.buildFromTemplate([
  {
    label: "设置",
    click: function () {
      console.log("setting");
    },
  },
  {
    label: "升级",
    click: function () {
      console.log("update");
    },
  },
  {
    label: "退出",
    click: function () {
      if (process.platform !== "darwin") {
        app.quit();
      }
    },
  },
]);

iconTray.setContextMenu(trayMenu);

iconTray.setToolTip("electron应用");

//实现点击关闭按钮让应用保存在托盘里面 ，双击托盘打开应用

let win = BrowserWindow.getFocusedWindow();

win.on("close", (e) => {
  console.log(win.isFocused());

  if (!win.isFocused()) {
    win = null;
  } else {
    e.preventDefault(); //阻止窗口的关闭事件
    win.hide();
  }
});

//监听任务栏图标的点击事件
iconTray.on("double-click", function () {
  win.show();
});

//闪烁图标

let count = 0;

let timer = setInterval(function () {
  count++;

  if (count % 2 == 0) {
    iconTray.setImage(path.join(__dirname, "../assets/favicon2.ico"));
  } else {
    iconTray.setImage(path.join(__dirname, "../assets/empty.ico"));
  }
}, 500);
