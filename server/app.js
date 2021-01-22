const http = require('http')
const https = require('https')
const fs = require('fs')
const express = require('express')
const serveIndex = require('serve-index')

const app = express()
app.use(serveIndex('./public')) // 进行浏览目录
app.use(express.static('./public'))
const httpServer = http.createServer(app)

httpServer.listen(2021, '0.0.0.0')
const options = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.pem'),
}
const httpsServer = https.createServer(options, app)
httpsServer.listen(2022, '0.0.0.0')
