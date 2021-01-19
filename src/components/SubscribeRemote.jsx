import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ZkToast from '../utils/toast'
import MyWebsocket from '../utils/websocket'
import Janus from '../utils/janus'
// import { Button } from 'antd'
function SubscribeRemote() {
  const [server] = useState('wss://120.26.89.217:4145')
  const ws = useRef(null)
  const janusRef = useRef(null)
  const refContainer = useRef(null)
  const spinNode = useRef(null)
  const pluginHandle = useRef(null)
  const [clientInfoState] = useState({
    c_share_ip: 'localhost',
    c_sharp_port: '8899',
    janus_port: '4145',
    hostname: 'localhost',
    protocol: 'http:',
    type: 'local',
    janus_id: '684896245067020',
    display: '主讲教室',
    room: '123456',
    role: '0',
    isScreen: 'false',
    audio_device_label: '',
    video_device_label: '',
  })

  const [tidMap, setTidMap] = useState({})
  useEffect(() => {
    // 初始化initJanus
    initJanus()
    navigator.mediaDevices.ondevicechange = mediaDeviceChange
    controlSpin(true, '等待客户端消息...')
  }, [])
  // 初始化 Janus
  const initJanus = () => {
    console.log(clientInfoState)
    const server = `wss://120.26.89.217:4145` // janus 服务
    const c_sharp_server_url = `wss://localhost:8899` // ws 服务
    /**
     * 链接c_sharp的server
     */
    initWss(c_sharp_server_url)
    /**
     * 初始化 Janus
     */
    Janus.init({
      debug: 'debug',
      callback: () => {
        janusInitCb()
      },
    })
  }
  const janusInitCb = () => {
    const janusConfig = {
      iceServers: [
        {
          urls: 'turn:120.26.89.217:3478',
          username: 'inter_user',
          credential: 'power_turn',
        },
      ],
      server,
      success: () => {
        console.log('成功的回调')
        loadLocalPluginHandle()
      },
    }
    janusRef.current = new Janus(janusConfig)
  }
  // 本地流发布 第一次默认选择设备后续由C#指定设备
  const loadLocalPluginHandle = () => {
    const opts = {
      plugin: 'janus.plugin.videoroom', // janus 插件
      opaqueId: 'video-room' + Janus.randomString(12), // 一个随机值，插件的唯一ID
      success: (plugin) => {
        console.log('loadLocalPluginHandle成功')
        // 1 . janus.js层创建的pluginHanle保存起来以备后用 其中 plugin 是插件句柄
        pluginHandle.current = plugin
        // 2 发送第一条消息
        sendFirstData()
        //3 janus 事件
        switchTypeEvent(
          'join',
          {
            room: '123456',
            display: '视频流的名称，发布时需要，订阅不需要',
            id: '123456789',
          },
          'auto_join'
        )
      },
    }
    /**
     * 浏览器与服务端的videoroom插件绑定，以便获取媒体流。 建立webrtc 连接
     */
    janusRef.current.attach(opts)
  }
  /**
   * 根据指令映射janus事件
   */
  const switchTypeEvent = (type, data, tid) => {
    console.log('type', type)
    console.log('data', data)
    console.log('tid', tid)

    const transtraction = uuidv4()
    if (tid) {
      setTidMap({
        [transtraction]: {
          tid,
          finish: (tid, msg) => {
            // const
          },
        },
      })
    }
  }
  const sendFirstData = () => {
    if (ws.current) {
      console.log(`这里有没有进来`)
      const sendData = createCbData('info', {
        code: '0',
        reason: 'cef初始化完成',
      })
      ws.current.send(sendData)
    }
  }
  const initWss = (c_sharp_server_url) => {
    ws.current = new MyWebsocket(
      c_sharp_server_url,
      null,
      true,
      25,
      null,
      (res) => {
        console.log('MyWebsocket', res)
      }
    )
  }
  // 检测设备的变动 拔出 插入等操作
  const mediaDeviceChange = async () => {
    console.log(`设备进行拔插操作`)
    const devices = await listDevices()
    console.log('devices', devices)
    // 设备拔插的载荷
    const payload = {
      code: 0,
      reason: '设备列表变动',
      devices: devices,
    }
    const sendData = createCbData('notify_device', null, payload)
    console.log('sendData', JSON.stringify(sendData))
    /**
     * {"from":{"who":"cef","ins":684896245067020},"to":{"who":"csharp"},"type":"notify_device_result","data":{"code":0,"reason":"设备列表变动","devices":{"audio":[{"deviceId":"default","kind":"audioinput","label":"Default - 麦克风 (USB Audio Device) (046d:0825)","groupId":"fc5b07d85af064f9969d6d34803e8675edf1d686f5d2c8f1d4487e6ae92f246e"}],"video":[{"deviceId":"dc0d8097b5a33b2e279a2a11b0e2f92b4c42e5d88fe2dee5d0021e631d665667","kind":"videoinput","label":"USB Video Device (046d:0825)","groupId":"fc5b07d85af064f9969d6d34803e8675edf1d686f5d2c8f1d4487e6ae92f246e"}],"audioOut":[]}}}
     */
    // 发消息
    ws.current.send(sendData)
  }

  /**
   * 构造消息内容
   */
  const createCbData = (type, tid, payload) => {
    let banseData = {
      from: {
        who: 'cef',
        ins: Number(clientInfoState.janus_id), // janus_id
      },
      to: { who: 'csharp' },
      type: `${type}_result`,
      data: payload,
    }
    if (tid) {
      banseData = { ...banseData, ...{ tid } }
    }
    return banseData
  }
  // 获取所有的设备列表
  const listDevices = () => {
    return new Promise((resolve, reject) => {
      const targetDevicesList = {
        audio: [],
        video: [],
        audioOut: [],
      }

      const audioGroup = [],
        videoGroup = [],
        speakerGroup = [] // 存放设备
      const filterList = ['screen-capture-recorder', 'zk_OBS-Camera'] // 排除设备
      try {
        navigator.mediaDevices.enumerateDevices().then((list) => {
          console.log('list', list) // {deviceId: "default", kind: "audioinput", label: "Default - 麦克风 (USB Audio Device) (046d:0825)", groupId: "cf5c0f2157d0d7faefeecc261a869c0db2d17d1cb1

          list.forEach((device) => {
            const { kind, label, groupId, deviceId } = device
            if (kind === 'audioinput' && !audioGroup.includes(groupId)) {
              targetDevicesList.audio.push(device)
              audioGroup.push(groupId)
            } else if (
              kind === 'videoinput' &&
              !filterList.includes(label) &&
              !videoGroup.includes(groupId)
            ) {
              targetDevicesList.video.push(device)
              videoGroup.push(groupId)
            } else if (
              kind === 'audio_output' &&
              !speakerGroup.includes(groupId)
            ) {
              targetDevicesList.audioOut.push(device)
              speakerGroup.push(groupId)
            }
            resolve(targetDevicesList)
          })
        })
      } catch (error) {
        console.log(`listDevices方法抛异常`)
        reject({
          audio: [],
          video: [],
          audioOut: [],
        })
      }
    })
  }
  const getClientInfo = () => {
    const search = `?local_ip=localhost&local_port=8899&janus_port=4145&
    janus_id=684896245067020&room=7890&type=local&role=0
        &display=主讲教室&screen=false&ice_servers=[
    {
      urls: 'turn:120.26.89.217:3478',
      username: 'inter_user',
      credential: 'power_turn',
    },
  ]`
    const hostname = `localhost`
    const protocol = `http:`
    if (!search) {
      ZkToast.error('缺少search参数', 3)
      return null
    }
    const urlParams = spliteSearch(search)
    console.log('urlParams', urlParams)

    return {
      c_share_ip: 'localhost',
      c_sharp_port: '8899',
      janus_port: '4145',
      hostname: hostname,
      protocol: protocol,
      type: 'local',
      janus_id: '684896245067020',
      display: '主讲教室',
      room: '123456',
      role: '0',
      isScreen: 'false',
      audio_device_label: '',
      video_device_label: '',
    }
  }

  /**
   * @description 获取url的拼接参数 返回参数的键值对
   * @param {String} search
   * @return {key: value}
   */
  const spliteSearch = (search) => {
    search = search.slice(1, search.length)
    let params = search.split('&')
    let paramDict = {}
    params.forEach((item) => {
      let [key, value] = item.split('=')
      paramDict[key] = value
    })
    return paramDict
  }
  const handleClick = () => {
    window.open('https://localhost:8899/')
  }
  const controlSpin = (show, text, loading = false) => {
    const node = spinNode.current
    if (show) {
      node.style = 'display:flex'
    } else {
      node.style = 'display:none'
    }
    if (text && show) {
      node.innerText = text
    }
    if (loading) {
      let image = document.createElement('img')
      image.src = require('../assets/loading.svg')
      node.appendChild(image)
    }
  }
  return (
    <div className="subscribe" ref={refContainer}>
      <div id="spin" ref={spinNode}></div>
    </div>
  )
}

export default SubscribeRemote
