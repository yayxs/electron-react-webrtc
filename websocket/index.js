const fs = require('fs')
const https = require('https')
const WebSocket = require('ws')
const { v4: uuid } = require('uuid')
const chalk = require('chalk')
const port = 8899
const allClient = {} // 存放所有类型的wss client

const server = https.createServer({
  cert: fs.readFileSync('./zk_ssl/server.pem'),
  key: fs.readFileSync('./zk_ssl/server.key'),
})
const wss = new WebSocket.Server({ server })

wss.on('connection', function connection(ws, request, client) {
  ws.on('message', function incoming(message) {
    console.log(chalk.redBright(`${JSON.parse(message).type}`))
    console.log('收到消息', message)
    // console.log(Array.from(wss.clients).length)
    wss.clients.forEach((ws_client) => {
      if (ws === ws_client) {
        // console.log(chalk.redBright('同一个客户端'))
      }
    })
    try {
      let jsonData = JSON.parse(message)
      let { type } = jsonData

      switch (type) {
        case 'info_result':
          // TODO 记录client信息
          break
        case 'join_result':
          // console.log(chalk.redBright('================'))
          sendDataWithType(ws, 'publish', 111, {})
          break
        default:
          break
      }
    } catch (error) {
      // TODO....catch error
    }
    // console.log(chalk.blue(JSON.stringify(wss)))
  })
})

function sendDataWithType(ws, type, ins, data) {
  let tid = uuid()
  let sendJsonData = {
    from: { who: 'csharp', ins },
    to: { who: 'cef' },
    type,
    tid,
    data: data,
  }
  ws.send(JSON.stringify(sendJsonData))
}

server.listen(port, (err) => {
  if (!err) {
    console.log('-----------------------')
  }
})
