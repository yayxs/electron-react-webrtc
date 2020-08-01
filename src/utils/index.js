/*
 * @Author: yayxs
 * @Date: 2020-07-31 20:47:03
 * @LastEditTime: 2020-07-31 21:28:30
 * @LastEditors: Please set LastEditors
 * @Description: 通用的工具方法
 * @FilePath: \electron-learn\utils\index.js
 */
const commonUtils = {
  // 防止冒泡捕获
  stopBubble(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    else window.event.cancelBubble = true;
  },
  // 取消默认事件 | 阻止默认行为
  stopDefault(e) {
    if (e && e.preventDefault) e.preventDefault();
    else window.event.returnValue = false;
    return false;
  },
};

module.exports = {
  commonUtils,
};
