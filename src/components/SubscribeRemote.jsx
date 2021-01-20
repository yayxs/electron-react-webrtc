import React, { useEffect, useRef, useState, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ZkToast from '../utils/toast'
import MyWebsocket from '../utils/websocket'
import Janus from '../utils/janus'

const initTidMap = {}

function SubscribeRemote() {
  const [server] = useState('wss://120.26.89.217:4145')
  const [room, setRoom] = useState('') // 保存当前的房间号
  const [stream, setStream] = useState(null) // 视频流
  const [deviceDict, setDeviceDict] = useState({
    audio: [],
    video: [],
  })
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
    janus_id: 684896245067020,
    display: '主讲教室',
    room: '7890',
    role: '0',
    isScreen: 'false',
    audio_device_label: '',
    video_device_label: '',
  })

  // const [tidMap, setTidMap] = useState({})

  const [tidMap, dispatchTidMap] = useReducer(reducer, initTidMap)
  function reducer(state, { type, payload }) {
    switch (type) {
      case 'ADD_KEY':
        // console.log('ADD_KEY', state)
        // console.log('ADD_key', payload)
        console.log('tidMap-----111-----')
        return {
          [payload.transtraction]: {
            tid: payload.tid,
            finish: (tid, msg) => {
              console.log('这个方法执行了没有')
              const { audio, video } = selectDevice
              const useVideo = widthIdGetItem(video, deviceDict.video)
              const useAudio = widthIdGetItem(audio, deviceDict.audio)
              let payload = msg
              if (type === 'publish' || type === 'change_device') {
                payload = {
                  ...msg,
                  devices: { audio: useAudio, video: useVideo },
                }
                if (tid === 'auto_publish_screen') {
                  // 这里判断是否是桌面发布  桌面发布设备传null
                  payload = { ...msg, devices: { audio: null, video: null } }
                }
              }
              let sendData = {
                from: {
                  who: 'cef',
                  ins: 684896245067020,
                },
                to: {
                  who: 'csharp',
                },
                type: `${type}_result`,
                tid: tid,
                data: payload,
              }
              console.log('-----node----type----', type)
              ws.current.send(sendData)
            },
          },
        }
      default:
        throw new Error()
    }
  }
  // 当前选中的设备
  const [selectDevice, setSelectDevice] = useState({
    video: null,
    audio: null,
  })
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
  const finishOrder = (transtraction, msg) => {
    if (transtraction in tidMap) {
      let { tid, finish, payloadEvent } = tidMap[transtraction]
      finish(tid, msg)
      if (payloadEvent && typeof payloadEvent === 'function') {
        // 给某一个指令增加的负载函数
        payloadEvent()
      }
      // 删除对应的属性
      const { [transtraction]: tmp, ...rest } = tidMap
      // setTidMap(rest)
      // delete tid_map[transtraction]
    }
  }
  //  const deleteStateVariable = (state,key)=>{
  //   const { [key]: tmp, ...rest } = state
  //   setState(rest)
  //  }
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
        //3 janus 事件 首先是join 加入
        switchTypeEvent(
          'join',
          {
            room: '7890',
            display: '主讲教室',
            id: '684896245067020',
          },
          'auto_join'
        )
      },

      /**
       * 是对janus服务端返回事件的处理逻辑它根据从janus服务端收到的不同消息类型做不同的逻辑处理
       * @param {*} msg
       * @param {*} jsep
       */
      onmessage: (msg, jsep) => {
        console.log('onmessage', msg)
        // console.log('jsep', jsep)
        let {
          videoroom: event,
          error,
          error_code,
          transaction,
          janus,
          reason,
          id,
          leaving,
        } = msg

        // console.log('--------------------')

        // console.log('event-videoroom', event)
        // console.log('error', error)
        // console.log('error_code', error_code)

        // console.log('janus', janus)
        // console.log('reason', reason)
        // console.log('id', id)
        // console.log('leaving', leaving)
        // console.log('--------------------')
        if (error) {
          ZkToast.error(error)
          if (transaction in tidMap) {
            finishOrder(transaction, { code: error_code, reason: error })
          }
        } else {
          console.log('transaction in tidMap', tidMap)
          if (transaction in tidMap) {
            finishOrder(transaction, { code: 0, reason: 'success' })
          }
        }
        if (jsep) {
          console.log('jsep')
        }
        // 处理子事件

        switch (event) {
          case 'joined':
            // let { video_device_label, audio_device_label } = this
            // this.switchTypeEvent('publish', {audio: audio_device_label, video: video_device_label}, 'auto_publish')
            if (false) {
              // 如果是桌面的话则自动发布桌面  后续通知C#发布的状态
              this.switchTypeEvent(
                'publish',
                { screen: true },
                'auto_publish_screen',
                'onmessage'
              )
            }
            break
          case 'event':
            if (transaction === 'unpublish') {
              setStream(null)
              this.stream = null
            }
            if (leaving === 'ok') {
              setStream(null)
            }
            break
          default:
            break
        }
      },
      iceState: (state) => {
        console.log(
          `可以通过该函数更新ICE状态。在videoroomtest.js中没有做任何处理`
        )
      },
      /**
       * 收到本地流时的回调函数
       * 当收到onlocalstream消息时，说明本地流已经准备就绪了，此时我们需要让本地流的视频在浏览器里显示出来
       */
      onlocalstream: (stream) => {
        console.log('流是什么', stream)
      },
    }
    /**
     * 浏览器与服务端的videoroom插件绑定，以便获取媒体流。 建立webrtc 连接
     */
    janusRef.current.attach(opts)
  }
  /**
   * widthIdGetItem 根据id 寻找设备
   */
  const widthIdGetItem = (id, devices) => {
    for (let i = 0, len = devices.length; i < len; i++) {
      let { deviceId, label } = devices[i]
      if (deviceId === id) {
        return {
          label,
          deviceId,
        }
      }
    }
    return {}
  }
  /**
   * 根据指令映射janus事件
   */
  const switchTypeEvent = (type, data, tid) => {
    // console.log('type', type)
    // console.log('data', data)
    // console.log('tid', tid)

    const transtraction = uuidv4()

    if (tid) {
      dispatchTidMap({
        type: 'ADD_KEY',
        payload: {
          transtraction,
          type,
          data,
          tid,
        },
      })
      // setTidMap({
      //   [transtraction]: {
      //     tid,
      //     finish: (tid, msg) => {
      //       console.log('这个方法执行了没有')
      //       const { audio, video } = selectDevice
      //       const useVideo = widthIdGetItem(video, deviceDict.video)
      //       const useAudio = widthIdGetItem(audio, deviceDict.audio)
      //       let payload = msg
      //       if (type === 'publish' || type === 'change_device') {
      //         payload = {
      //           ...msg,
      //           devices: { audio: useAudio, video: useVideo },
      //         }
      //         if (tid === 'auto_publish_screen') {
      //           // 这里判断是否是桌面发布  桌面发布设备传null
      //           payload = { ...msg, devices: { audio: null, video: null } }
      //         }
      //       }
      //       let sendData = {
      //         from: {
      //           who: 'cef',
      //           ins: 684896245067020,
      //         },
      //         to: {
      //           who: 'csharp',
      //         },
      //         type: `${type}_result`,
      //         tid: tid,
      //         data: payload,
      //       }
      //       console.log('-----node----type----', type)
      //       ws.current.send(sendData)
      //     },
      //   },
      // })
    }

    console.log('type--2', type)
    // 开始根据不同的type类型处理数据

    switch (type) {
      // 注意这个写成json 拉  苦笑~
      case 'join':
        const { display, id, room } = data
        let register = {
          request: 'join',
          ptype: 'publisher',
          display,
          id,
          room: room,
        }
        setRoom(room)
        pluginHandle.current.send({ message: register }, transtraction)
        break

      default:
        break
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
    console.log('ws init 143')
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
      janus_id: 684896245067020,
      display: '主讲教室',
      room: '7890',
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
      <div>{JSON.stringify(tidMap)}</div>
    </div>
  )
}

export default SubscribeRemote
