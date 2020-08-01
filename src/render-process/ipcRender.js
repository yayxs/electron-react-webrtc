/*
 * @Author: your name
 * @Date: 2020-08-01 13:08:15
 * @LastEditTime: 2020-08-01 19:32:41
 * @LastEditors: Please set LastEditors
 * @Description: 从渲染器进程到主进程的异步通信。
 * @FilePath: \electron-editor\src\render-process\ipcRender.js
 */
const {
  ipcRenderer,
  remote: {
    dialog: { showOpenDialogSync, showSaveDialog },
  },
} = require("electron");
const fs = require("fs");
const {
  commonUtils: { getDom },
} = require("../utils");
let textDom = getDom("textarea");

// 监听浏览器的右键事件
window.addEventListener("contextmenu", () => {
  // console.log(`点击了右键`);
  // 阻止默认行为
  commonUtils.stopDefault();
  ipcRenderer.send("async-meg-right-menu", "");
});
// 监听主进程的操作
ipcRenderer.on("action", (evt, type) => {
  switch (type) {
    case "open-files":
      console.log(`点击了打开文件`);
      try {
        const res = showOpenDialogSync({ properties: ["openFile"] });
        // 读取文件
        console.log(res);

        if (res && res.length) {
          const con = fs.readFileSync(res[0]);
          console.log(con);
          textDom.value = con;
        }
      } catch (error) {}
      break;
    case "save-files":
      console.log(`点击了保存,写入文件`);
      showSaveDialog(null, {
        defaultPath: "defaultPath.txt",
        filters: [{ name: "All Files", extensions: ["*"] }],
      })
        .then((res) => {
          console.log(`res${JSON.stringify(res)}`);
          let filePath = null;
          if (res && res.filePath) {
            filePath = res.filePath;
          }
          console.log(filePath);
          // 开始写入文件
          try {
            fs.writeFileSync(filePath, textDom.value);
          } catch (error) {}
        })
        .catch((err) => {
          console.log(err);
        });
      break;
    default:
      break;
  }
});
