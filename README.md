## About Electron

1. `electron` + `chrom内核` + `node.js能力` + `Native Api`
 -  nodejs 底层的能力
 -  native api 跨平台 原生

2. 为什么PC版本

 - 便捷入口
 - 离线可用
 - 安全需求
 - 调用系统的能力

3. Native  vs QT vs NW.js


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

## notice

```js
app.commandLine.appendSwitch('--ignore-certificate-errors', 'true') // 取消 限制
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
