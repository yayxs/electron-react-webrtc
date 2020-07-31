// 工具方法
const utils = {
  // 是否是macOs
  isMacOS() {
    return process.platform === "darwin";
  },
  // 是否是调试模式
  isDebug() {
    return /--debug/.test(process.argv[2]);
  },
};
module.exports = {
  utils,
};
