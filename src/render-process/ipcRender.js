/**
 * 消息通知 基于h5的通知api 实现
 */

const path = require("path");
const { commonUtils } = require(path.join(__dirname, "../utils/index"));
let dom = commonUtils.getDom("#btn");
// console.log(dom)
dom.onclick = () => {};
window.addEventListener("online", () => {
  console.log(`有网络`);
});
window.addEventListener("offline", () => {
  notification();
});
function notification() {
  const options = {
    title: "通知",
    body: "ele 通知body信息",
  };
  let notic = new window.Notification(options["title"], options);
  console.log(notic);
  notic.onclick = () => {
    console.log(`点击`);
  };
}
