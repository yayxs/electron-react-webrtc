const path = require("path");
const glob = require("glob");
const finPath = path.join(__dirname, "main-process/**/*.js");
glob(finPath, null, (err, files) => {
  if (err) {
    console.log(`出现错误`);
  }
  // 其中files 是读取的js文件 ['D:/github-code/electron-learn/main/main.js']
  requireMainProcess(files);
});
// 加载主进程脚本
const requireMainProcess = (files) => {
  for (let i = 0, l = files.length; i < l; i++) {
    require(files[i]);
  }
};
