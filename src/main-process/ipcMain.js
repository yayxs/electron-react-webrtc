/*
 * @Author: your name
 * @Date: 2020-08-01 12:40:14
 * @LastEditTime: 2020-08-01 20:17:36
 * @LastEditors: Please set LastEditors
 * @Description: 从主进程到渲染进程的异步通信
 * @FilePath: \electron-editor\src\main-process\ipcMain.js
 */
const {
  app,
  Menu,
  ipcMain,
  BrowserWindow: { getFocusedWindow },
} = require("electron");

const isMac = process.platform === "darwin";

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "文件",
    submenu: [
      {
        label: "新建",
        click: () => {
          /**
           * 使用webCon 渲染以及控制 web 页面
           *
           */
          getFocusedWindow().webContents.send("action", "new-files");
        },
      },
      {
        label: "打开",
        click: () => {
          /**
           * 使用webCon 渲染以及控制 web 页面
           *
           */
          getFocusedWindow().webContents.send("action", "open-files");
        },
      },
      {
        label: "保存",
        click: () => {
          /**
           * 使用webCon 渲染以及控制 web 页面
           *
           */
          getFocusedWindow().webContents.send("action", "save-files");
        },
      },
      { type: "separator" },

      isMac
        ? { label: "退出", role: "close" }
        : { label: "退出", role: "quit" },
    ],
  },
  // { role: 'editMenu' }
  {
    label: "编辑",
    submenu: [
      { label: "撤销", role: "undo" },
      { label: "恢复", role: "redo" },
      { type: "separator" },
      { label: "剪切", role: "cut" },
      { label: "复制", role: "copy" },
      { label: "粘贴", role: "paste" },
      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
            },
          ]
        : [
            { label: "删除", role: "delete" },
            { type: "separator" },
            { label: "全选", role: "selectAll" },
          ]),
    ],
  },
  // { role: 'viewMenu' }
  {
    label: "视图",
    submenu: [
      { role: "reload" },
      { role: "forcereload" },
      { role: "toggledevtools" },
      { type: "separator" },
      { role: "resetzoom" },
      { role: "zoomin" },
      { role: "zoomout" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  },
  // { role: 'windowMenu' }

  {
    label: "帮助",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// 定义右键菜单
const rightClickTemplate = [
  { label: "撤销", role: "undo" },
  { label: "恢复", role: "redo" },
  { type: "separator" },
  { label: "剪切", role: "cut" },
  { label: "复制", role: "copy" },
  { label: "粘贴", role: "paste" },
  ...(isMac
    ? [
        { role: "pasteAndMatchStyle" },
        { role: "delete" },
        { role: "selectAll" },
        { type: "separator" },
        {
          label: "Speech",
          submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
        },
      ]
    : [
        { label: "删除", role: "delete" },
        { type: "separator" },
        { label: "全选", role: "selectAll" },
      ]),
];
const rightMenu = Menu.buildFromTemplate(rightClickTemplate);
// 主进程中
ipcMain.on("async-meg-right-menu", (event, arg) => {
  console.log(arg); // prints "ping"
  rightMenu.popup(BrowserWindow.getFocusedWindow());
  // event.reply("asynchronous-reply", "pong");
});
