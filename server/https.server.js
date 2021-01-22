const https = require('https')
const fs = require('fs')

/**
 * options
 */
const options = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.pem'),
}
const app = https
  .createServer(options, (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' }) // 响应头 内容是文本
    res.end('https-okay') // 响应结束
  })
  .listen(9090, '0.0.0.0')
