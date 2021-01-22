const http = require('http')

/**
 * 创建http服务
 * req 请求
 * res 响应
 */
const app = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' }) // 响应头 内容是文本
  res.end('okay') // 响应结束
})
/**
 * desc 提供8080端口
 */
app.listen('8080', '0.0.0.0')
