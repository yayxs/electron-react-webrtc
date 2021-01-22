/*
 * @Author: your name
 * @Date: 2020-08-01 13:08:15
 * @LastEditTime: 2020-08-01 21:03:56
 * @LastEditors: Please set LastEditors
 * @Description: 从渲染器进程到主进程的异步通信。
 * @FilePath: \electron-editor\src\render-process\ipcRender.js
 */
const {
  ipcRenderer,
  remote: {
    dialog: { showOpenDialogSync, showSaveDialog, showMessageBoxSync },
  },
} = require("electron");
const fs = require("fs");
const {
  commonUtils: { getDom },
} = require("../utils");
let textDom = getDom("textarea");
let currFilePath = null; // 保存的文件路径
let isSavaFlag = true; // 当前文件是否是保存的状态
document.title = "无标题";
// 编辑器正在编辑的时候
textDom.oninput = () => {
  if (isSavaFlag) {
    let temp = document.title;
    document.title = `${temp} *`;
  }
  isSavaFlag = false; // 改为编辑态
};
// 监听浏览器的右键事件
window.addEventListener("contextmenu", () => {
  // 阻止默认行为
  commonUtils.stopDefault();
  ipcRenderer.send("async-meg-right-menu", "");
});
// 监听主进程的操作
ipcRenderer.on("action", (evt, type) => {
  switch (type) {
    case "new-files":
      whetherSava(); // 是否要保存
      textDom.value = "";
      break;
    case "open-files":
      whetherSava(); // 是否要保存

      try {
        const res = showOpenDialogSync({ properties: ["openFile"] });
        // 读取文件

        if (res && res.length) {
          const con = fs.readFileSync(res[0]);
          textDom.value = con;
        }
      } catch (error) {}
      break;
    case "save-files":
      doSava();
      break;
    case "quit":
      whetherSava();
      ipcRenderer.send("quit-app");
      break;
    default:
      break;
  }
});
/**
 * 询问是否要保存 在没有保存的状态下
 */
const whetherSava = () => {
  if (!isSavaFlag) {
    try {
      let idx = showMessageBoxSync(null, {
        type: "question",
        message: "是否要保存此文件?",
        buttons: ["OK", "NO"],
      });
      if (idx === 0) {
        doSava();
      } else if (idx === 1) {
      }
    } catch (error) {}
  }
};
// 保存
const doSava = () => {
  if (currFilePath) {
    try {
      writeFileAndChangeFlag(currFilePath, textDom.value);
    } catch (error) {}
  } else {
    // 当前的路径不存在
    showSaveDialog(null, {
      defaultPath: "defaultPath.txt",
      filters: [{ name: "All Files", extensions: ["*"] }],
    })
      .then((res) => {
        if (res && res.filePath) {
          currFilePath = res.filePath;
          writeFileAndChangeFlag(currFilePath, textDom.value);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

/**
 *
 * @param {*} currFilePath 当前路径
 * @param {*} val 输入的值
 */
const writeFileAndChangeFlag = (currFilePath, val) => {
  // 开始写入文件
  fs.writeFileSync(currFilePath, val);
  isSavaFlag = true;
  document.title = currFilePath;
};
