/*
 * @Author: your name
 * @Date: 2020-08-01 13:08:15
 * @LastEditTime: 2020-08-01 13:17:26
 * @LastEditors: Please set LastEditors
 * @Description: 从渲染器进程到主进程的异步通信。
 * @FilePath: \electron-editor\src\render-process\ipcRender.js
 */
const { ipcRenderer } = require("electron");
const { commonUtils } = require("../utils");
// 监听浏览器的右键事件
window.addEventListener("contextmenu", () => {
  // console.log(`点击了右键`);
  // 阻止默认行为
  commonUtils.stopDefault();
  ipcRenderer.send("async-meg-right-menu", "");
});
