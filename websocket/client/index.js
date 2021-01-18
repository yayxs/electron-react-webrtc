const WebSocket = require('ws')
const ws = new WebSocket('ws://127.0.0.1:8899')

// 打开WebSocket连接后立刻发送一条消息:
ws.on('open', function () {
  // ws.send('Hello!')
})
ws.on('message', function (message) {})
