## Web Preview

在 web 浏览器中预览效果图，通过<video /> 读取数据流
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a4dd8dd3baf41ffb688592899202627~tplv-k3u1fbpfcp-watermark.image)

## About Electron

1. `electron` + `chrom内核` + `node.js能力` + `Native Api`

- 拥有`nodejs`底层的能力
- `nativeApi`跨平台原生的能力

2. 为什么会出现`PC`版本

- 便捷入口
- 离线可用
- 安全需求
- 调用系统的能力

3. 目前的桌面方案

- Native
- QT
- NW.js

## About Webrtc （More read ./docs/note.md）

> 建立浏览器之间点对点（Peer-to-Peer）的连接
> 实现视频流和（或）音频流或者其他任意数据的传输
> 创建点对点（Peer-to-Peer）的数据分享和电话会议成为可能

- 音视频的实时互动
- 回音消除
- 降噪
- 跨平台的
- 非音视频的传输

### 整体架构

- C++ api 对点连接
- 上下文管理层
- 音频引擎 视频引擎
- 音频的采集与渲染
- 浏览器的采集与渲染

### 资料

- 官网 [https://webrtc.org/](https://webrtc.org/)
- 谷歌提供的演练 demo [appr.tc](https://appr.tc/r/112233445566)
- [WebRTC API](https://developer.mozilla.org/zh-CN/docs/Web/API/WebRTC_API)
- [https://www.html5rocks.com/en/tutorials/webrtc/basics/](https://www.html5rocks.com/en/tutorials/webrtc/basics/)

## About `<video />` label

- autoplay 自动播放
- playsinline 使用自带

## Fast Start

```sh
yarn
yarn dev // 开发模式下 electron 加载  react起的 3000 服务
```

## Use Technology

- webrtc 技术 js Api
- Janus 流媒体服务
- electron Pc 客户端展现
- websocket 服务
- react hooks

## Notice

- electron 主进程取消 证书的限制
  ```js
  app.commandLine.appendSwitch('--ignore-certificate-errors', 'true') // 取消 限制
  ```
- react 中的 useReducer() // 在生产环境执行两次派发
- test 浏览器地址传参

```js
http://localhost:3001/?local_ip=localhost&local_port=8899&janus_port=4145&janus_id=684896245067020&room=7890&type=local&role=0&display=%E4%B8%BB%E8%AE%B2%E6%95%99%E5%AE%A4&screen=false&ice_servers=[{%22urls%22:%22turn:120.26.89.217:3478%22,%22username%22:%22inter_user%22,%22credential%22:%22power_turn%22}]#/
```

- 谷歌浏览器参数限制
  [https://www.cnblogs.com/Wayou/p/using_MediaDevices_getUserMedia_wihtout_https.html](https://www.cnblogs.com/Wayou/p/using_MediaDevices_getUserMedia_wihtout_https.html)

## Git

- feat 增加新功能
- fix 修复问题/BUG
- style 代码风格相关无影响运行结果的
- perf 优化/性能提升
- refactor 重构
- revert 撤销修改
- test 测试相关
- docs 文档/注释
- chore 依赖更新/脚手架配置修改等
- workflow 工作流改进
- ci 持续集成
- types 类型定义文件更改
- wip 开发中
