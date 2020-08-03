//clipboard模块可以在主进程里面使用 也可以在渲染进程里面使用

var { clipboard, nativeImage } = require("electron");

//执行复制操作

//复制
// clipboard.writeText('机器码')

// 粘贴

// clipboard.readText();

var code = document.querySelector("#code");
var btn = document.querySelector("#btn");
var input = document.querySelector("#input");

code.onclick = function () {
  clipboard.writeText(code.innerHTML);

  alert("复制成功"); //写一个div提示
};

btn.onclick = function () {
  //获取复制的内容
  input.value = clipboard.readText();
};

//监听按钮点击复制图片的事件

var btncopyimg = document.querySelector("#btncopyimg");

btncopyimg.onclick = function () {
  //复制图片黏贴到我们页面上

  /*
    1.引入nativeImage

    2、创建一个nativeImage的对象

    */

  var image = nativeImage.createFromPath("static/favicon2.ico");

  //复制图片
  clipboard.writeImage(image);

  //粘贴图片

  var imgsrc = clipboard.readImage().toDataURL();

  console.log(imgsrc); //base64的地址

  //创建一个img标签 指定他的src
  var imgDom = new Image();

  imgDom.src = imgsrc;

  document.body.appendChild(imgDom);
};
