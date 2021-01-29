## WebRtc 类

- MediaStream
- RTCPeerConnection
- RTCDataChannel 传输文本等

## `web`服务器(node)

### 目前的种类

- node.js
- nginx
- apache

### 查看`TCP`服务

```js
netstat
```

### 永久启动服务

```shell
npm i -g forever
```

### 生成 https 证书

- 认证证书
- 私有证书
- 指定的证书位置
- 创建 https 服务

### 构建一个 web 服务器

- 同时支持`http` `https` 协议

## navigator.mediaDevices

- id 设备的 id
- label 设备的名字
- kind 设备的种类
- groupID 说明是同一物理设备

## 音视频采集 API

- 音频大小 延迟
- 视频的分辨率等等

## getUserMedia 的不同实现

`adapter`

## 视频的约束

- 4:3 16:9（720\*1280）
- 比例 aspectRatio(一般不获取)
- 帧率的多少控制码流
- fra
- facing 控制摄像头的反转 （前置摄像头或者后置摄像头如果是双摄像头）
- user
- envi
- left
- right
- 是否裁剪 resize

## 音频的约束

- volume 0-1
- 回音 是否开始回音消除
- 自动增益 是否增加音量 true|false
- 降噪 采集数据的时候是否开始
- 延迟大小 网络状况不稳定的时候 双方实时通讯 200ms 以内 500ms latency
- channelCount 单声道还是双声道
- deviceID 进行设备的切换
- groupID 音频的输入和输出 同一个物理设备
