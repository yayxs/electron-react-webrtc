## About Electron

1. `electron` + `chrom内核` + `node.js能力` + `Native Api`

- nodejs 底层的能力
- native api 跨平台 原生

2. 为什么 PC 版本

- 便捷入口
- 离线可用
- 安全需求
- 调用系统的能力

3. Native vs QT vs NW.js

## fast start

```sh
yarn

yarn dev // 开发模式下 electron 加载  react起的 3000 服务
```

## Use

- webrtc 技术 js Api
- Janus 流媒体服务
- electron Pc 客户端展现
- websocket 服务
- react hooks

## Notice

```js
app.commandLine.appendSwitch('--ignore-certificate-errors', 'true') // 取消 限制
useReducer() // 在生产环境执行两次派发
```

```js
http://localhost:3001/?local_ip=localhost&local_port=8899&janus_port=4145&janus_id=684896245067020&room=7890&type=local&role=0&display=%E4%B8%BB%E8%AE%B2%E6%95%99%E5%AE%A4&screen=false&ice_servers=[{%22urls%22:%22turn:120.26.89.217:3478%22,%22username%22:%22inter_user%22,%22credential%22:%22power_turn%22}]#/
```

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
