import React, { Component } from 'react'
import Janus from '../utils/janus'
import { Select, Button } from 'antd'
import ZkToast from '../utils/toast'
// import './subscribe_remote.scss'
import Zkws from '../utils/websocket'
import { v4 as uuidv4 } from 'uuid'
import Axios from 'axios'

const { Option } = Select
const isDev = process.env.NODE_ENV === 'development' ? true : false
const simulcast2 = false
class SubScribe extends Component {
  constructor() {
    super()
    this.state = {
      stream: null,
      video_device_id: null,
      audio_device_id: null,
      deviceDict: {
        audio: [],
        video: [],
      },
      muted: false,
      showSpin: true,
    }
    this.cefstatus = 'peeding' // CEF的状态 ["peeding", "publish", ""]
    this.type = null
    this.role = 1 // 不传默认为听讲
    this.isScreen = false
    this.room = null
    this.display = null
    this.class_id = null
    this.class_name = null
    this.remote_id = null
    this.janus_id = null
    this.pluginHandle = null
    this.checkListParticipantsHandle = null
    this.timer = null
    this.videoTimer = null //视频信息
    this.tid_map = {}
    this.video_muted = false
    this.mutedRtc = false // MIC是否静音
    this.selectDevice = {
      video: null,
      audio: null,
    }
    this.isSubscribed = false
    this.iceServers = []
    this.room_participants = [] // 记录房间的所有人员的变动
    this.subscribeDict = {} // 维护订阅列表
    this.videoRef = React.createRef()
    this.displayRef = React.createRef()
    this.spinNode = React.createRef()
    this.volume_value = React.createRef()
    this.rtcMicNode = React.createRef()
    this.cefroot = React.createRef()
    this.no_stream_node = React.createRef()
  }
  /**
   * @description 获取url的拼接参数 返回参数的键值对
   * @param {String} search
   * @return {key: value}
   */
  spliteSearch(search) {
    search = search.slice(1, search.length)
    let params = search.split('&')
    let paramDict = {}
    params.forEach((item) => {
      let [key, value] = item.split('=')
      paramDict[key] = value
    })
    return paramDict
  }
  /**
   *
   * @param {Object} pluginHandle 插件句柄
   * @param {Boolean} useAudio 是否使用语音
   * @param { Boolean } isScreen 是否发布桌面
   * @param {Object} {video_device_id, audio_device_id}  使用的video_input_device_id
   * @param {String} transaction Janus的transaction
   */
  publishOwnFeed(
    pluginHandle,
    useAudio,
    isScreen,
    { video_device_id, audio_device_id },
    transaction,
    target
  ) {
    this.controlSpin(true, `${target}发布本地音视频...`, true)
    let { role } = this
    // 标识选择的设备后续通知C#
    this.selectDevice.audio = audio_device_id
    this.selectDevice.video = video_device_id

    // 通过Janus发布本地音视频
    pluginHandle.createOffer({
      media: {
        video: isScreen ? 'screen' : 'video',
        captureDesktopAudio: isScreen, // 发布桌面共享
        audioRecv: false,
        audio: isScreen ? false : true,
        videoRecv: false,
        audioSend: useAudio,
        videoSend: true,
        replaceAudio: true,
        replaceVideo: true,
        role,
        video_device_id: video_device_id || null,
        audio_device_id: audio_device_id || null,
      }, // Publishers are sendonly
      simulcast: false,
      simulcast2: simulcast2,
      success: function (jsep) {
        let publish = {
          request: 'configure',
          audio: useAudio,
          video: true,
          bitrate: role === 0 ? 400000 : 200000,
        }
        pluginHandle.send({ message: publish, jsep: jsep }, transaction)
      },
      error: function (error) {
        Janus.error('WebRTC error:', error)
        ZkToast.error('WebRTC error... ' + JSON.stringify(error))
      },
    })
  }
  // 静音的处理
  toggleMute(data) {
    if (this.pluginHandle) {
      var muted = this.pluginHandle.isAudioMuted()
      this.setState({
        muted: data,
      })
      if (muted && !data) {
        this.pluginHandle.unmuteAudio()
      } else {
        this.pluginHandle.muteAudio()
      }
    }
  }
  // 获取声音的大小 根据role和cef_if来确定获取local还是remote
  getVolume(plugin) {
    let { type } = this
    if (plugin) {
      if (this.timer) {
        clearInterval(this.timer)
      }
      if (type === 'local') {
        plugin.getLocalVolume()
      } else if (type === 'remote') {
        plugin.getRemoteVolume()
      }
      if (this.video_muted && this.mutedRtc) {
        clearInterval(this.timer)
      } else {
        let nodeDom = this.volume_value.current
        let local_mic_node = this.rtcMicNode.current
        this.timer = setInterval(() => {
          let volume = 0
          if (type === 'local') {
            volume =
              plugin.webrtcStuff.volume.local &&
              plugin.webrtcStuff.volume.local.value
                ? parseInt(plugin.webrtcStuff.volume.local.value * 100)
                : 0
          } else if (type === 'remote') {
            volume =
              plugin.webrtcStuff.volume.remote &&
              plugin.webrtcStuff.volume.remote.value
                ? parseInt(plugin.webrtcStuff.volume.remote.value * 100)
                : 0
          }
          if (!this.video_muted && nodeDom) {
            nodeDom.setAttribute(
              'style',
              `background:linear-gradient(to right, #fff83f, #fff ${volume}%) no-repeat;`
            )
          }
          if (!this.mutedRtc && local_mic_node) {
            local_mic_node.setAttribute(
              'style',
              `width: 9px;
            height: 17px;
            background:linear-gradient(to top, #fff83f ${volume}%, transparent ${
                volume + 30
              }%);
            position: relative;
            top: 3px;
            left: 50%;
            transform: translateX(-54%);
            border-radius: 5px;`
            )
          }
          // nodeDom.innerHTML = volume;
        }, 200)
      }
    }
  }
  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.videoTimer) {
      clearInterval(this.videoTimer)
    }
  }
  /**
   * @description 获取客户端的信息
   * c#本地的wss服务信息 janus服务的信息 cef的类型等
   */
  gatherClientInfo() {
    let { hostname, protocol, search } = window.location
    if (!search) {
      ZkToast.error('缺少客户端ip,无法通信', 3)
      return null
    }
    // let decode_search = decodeURIComponent(search);
    let {
      local_ip: c_share_ip,
      role,
      local_port: c_sharp_port,
      janus_port,
      janus_id,
      type,
      ice_servers,
      room,
      display,
      video_device_label,
      audio_device_label,
      screen: isScreen,
    } = this.spliteSearch(search)
    // c# ws_server的ip 和端口号                       Janus的wss port
    if (!(c_share_ip && c_sharp_port && janus_port)) {
      ZkToast.error('客户端信息不足,无法进行通信')
      return null
    }
    if (!janus_id) {
      ZkToast.error('cef id未指定')
      return
    }
    if (!type) {
      ZkToast.error('CEF类型不明')
      return
    }
    if (type === 'local') {
      if (!(room && display && janus_id)) {
        ZkToast.error('room display janus_id缺一不可')
        return
      }
    }
    if (type === 'remote') {
      if (!(room && janus_id)) {
        ZkToast.error('room janus_id缺一不可')
        return
      }
    }
    if (ice_servers) {
      this.iceServers = eval(decodeURI(ice_servers))
    }
    return {
      c_share_ip,
      c_sharp_port,
      janus_port,
      hostname,
      protocol,
      type,
      janus_id,
      display,
      room: room,
      role,
      isScreen,
      audio_device_label: decodeURI(audio_device_label),
      video_device_label: decodeURI(video_device_label),
    }
  }
  componentDidMount() {
    // let clientInfo = this.gatherClientInfo() // 获取客户端信息
    // if (clientInfo) {
    //   let {
    //     type,
    //     janus_id,
    //     room,
    //     display,
    //     role,
    //     isScreen,
    //     video_device_label,
    //     audio_device_label,
    //   } = clientInfo
    this.janus_id = '684896245067020'
    this.type = 'local'
    this.room = '7890'
    this.role = 0
    this.display = '主讲教室'
    this.isScreen = false
    this.video_device_label = ''
    this.audio_device_label = ''

    this.initJanus() // 初始化Janus
    navigator.mediaDevices.ondevicechange = this.mediaDeviceChange
    this.controlSpin(true, '等待客户端消息...')
  }
  // 检测设备的插拔
  mediaDeviceChange = async (_) => {
    let devices = await this.listDevices()
    let payload = {
      code: 0,
      reason: '设备列表变动',
      devices: devices,
    }
    let sendData = this.createCbData('notify_device', null, payload)
    this.wss_client.send(sendData)
  }
  /**
   *
   * @param { String } type 消息[指令]类型
   * @param {Object} payload 回复给C#的消息内容
   */
  createCbData(type, tid, payload) {
    let banseData = {
      from: {
        who: 'cef',
        ins: Number(this.janus_id),
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
  /**
   * @description 给C#发送第一条消息告知cef加载完成
   */
  sendFirstData() {
    if (this.wss_client) {
      let sendData = this.createCbData('info', {
        code: '0',
        reason: 'cef初始化完成',
      })
      this.wss_client.send(sendData)
    }
  }
  /**
   * @description  随机产生一个16位的数字id
   */
  randomIntId() {
    let num = Math.random()
    if (num - 0.01 < 0) {
      num = Math.random()
    }
    return num * Math.pow(10, 16)
  }
  /**
   * @description 完成指令给c_sharp回复消息
   * @param {String} transtraction 映射tid的识别号
   */
  finishOrder(transtraction, msg) {
    if (transtraction in this.tid_map) {
      let { tid, finish, payloadEvent } = this.tid_map[transtraction]
      finish(tid, msg)
      if (payloadEvent && typeof payloadEvent === 'function') {
        // 给某一个指令增加的负载函数
        payloadEvent()
      }
      delete this.tid_map[transtraction]
    }
  }
  /**
   * @description 链接C_Sharp客户端的wss_server
   * @param {String} url
   */
  initWss(url) {
    this.wss_client = new Zkws(url, null, true, 25, null, (res) => {
      let { code, data: ws_data } = res
      if (code === 0 && 'data' in res) {
        let jsonData = JSON.parse(ws_data)
        console.log('wss发送发布的指令', jsonData)
        let { type, data, from, tid } = jsonData
        // 提前检查数据的格式是否符合文档要求
        let [preDataResult, reason] = this.preCheckData(type, data)
        if (preDataResult) {
          this.switchTypeEvent(type, data, tid, 'initWss')
        } else {
          let payload =
            type === 'publish' && this.isScreen
              ? { code: 0, reason }
              : { code: 1, reason }
          let sendData = this.createCbData(type, tid, payload)
          this.wss_client.send(sendData)
        }
      } else {
        // 错误处理;
        ZkToast.error(res.data)
      }
    })
  }
  /**
   * @description 这里根据指令类型做数据校验,放置后续处理发送错误
   * @param {String} type c#发送的指令类型
   * @param {Any} data c#发送的负载数据
   * @returns Boolean
   */
  preCheckData(type, data) {
    let { type: cef_type, isScreen } = this,
      remote_unsupport = [
        'publish',
        'unpublish',
        'join',
        'change_device',
        'toggle_mute',
        'configure',
      ],
      local_unsupport = ['subscribe', 'unsubscribe']
    if (cef_type === 'remote') {
      // remote能支持的指令类型和数据校验
      if (remote_unsupport.includes(type)) {
        return [false, `remote不支持${type}事件`]
      }
      if (type === 'subscribe') {
        // 有janus_id的数据才符合指令要求
        if (!('janus_id' in data)) {
          return [false, '无订阅的id无法进行订阅']
        }
        return [true]
      } else {
        return [true]
      }
    } else if (cef_type === 'local') {
      if (isScreen && type === 'publish') {
        return [false, '屏幕共享已经自动发布']
      }
      if (local_unsupport.includes(type)) {
        return [false, `local不支持${type}事件`]
      }
      if (type === 'join') {
        if (!('room' in data && 'display' in data && 'id' in data)) {
          return [false, '加入房间信息不完整请检查room、display、id是否完整']
        }
        return [true]
      } else if (
        type === 'publish' ||
        type === 'unpublish' ||
        type === 'capture' ||
        type === 'toggle_mute' ||
        type === 'change_device' ||
        type === 'get_device'
      ) {
        return [true]
      } else if (type === 'configure') {
        if (typeof data !== 'object') {
          return [false, 'configure负载数据类型不符合要求']
        }
        return [true]
      } else {
        return [false, '数据格式错误']
      }
    } else {
      return [false, '数据格式错误']
    }
  }
  // 根据设备id 寻找设备
  widthIdGetItem(id, devices) {
    for (let i = 0; i < devices.length; i++) {
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
   * @description 根据指令映射不同的Janus事件
   * @param {String} type 指令类型
   * @param {Object} data 指令的负载数据
   * @param {String} tid transtraction
   */
  switchTypeEvent(type, data, tid, target) {
    let times = 1
    let dataType = typeof data
    if (dataType == 'object') {
    } else {
    }
    let { janus_id } = this
    let transtraction = uuidv4()
    if (tid) {
      this.tid_map[transtraction] = {
        tid,
        finish: (tid, msg) => {
          // 直接调用finish并传参和回复csharp消息
          let { audio, video } = this.selectDevice
          let { deviceDict } = this.state
          let useVideo = this.widthIdGetItem(video, deviceDict.video)
          let useAudio = this.widthIdGetItem(audio, deviceDict.audio)
          let payload = msg
          if (type === 'publish' || type === 'change_device') {
            times = 2
            payload = { ...msg, devices: { audio: useAudio, video: useVideo } }
            if (tid === 'auto_publish_screen') {
              // 这里判断是否是桌面发布  桌面发布设备传null
              payload = { ...msg, devices: { audio: null, video: null } }
            }
          }
          let sendData = {
            from: {
              who: 'cef',
              ins: Number(janus_id),
            },
            to: {
              who: 'csharp',
            },
            type: `${type}_result`,
            tid: tid,
            data: payload,
          }
          /**
           * 第一次发消息是加入提示join_result
           */
          console.log(`times${times}`, payload)
          this.wss_client.send(sendData)
        },
      }
    }
    // 以下事件处理Janus获取数据逻辑 数据以及数据的合理性
    switch (type) {
      case 'get_device': // 获取本机的webrtc的可用设备
        this.listDevices().then((res) => {
          this.finishOrder(transtraction, {
            code: 0,
            data: res,
            reason: 'success',
          })
        })
        break
      case 'publish':
        let { audio, video, screen } = data // screen优先 screen为true时发布桌面
        if (screen) {
          this.publishOwnFeed(
            this.pluginHandle,
            true,
            true,
            {},
            transtraction,
            'switchTypeEvent'
          )
        } else {
          this.publishControl(audio, video, transtraction)
        }
        break
      case 'change_device': // 音视频通话过程中改变设备
        let { audio: change_audio, video: change_video } = data
        if (change_audio) {
          this.selectDevice.audio = change_audio
        }
        if (change_video) {
          this.selectDevice.video = change_video
        }
        this.publishOwnFeed(
          this.pluginHandle,
          true,
          false,
          {
            video_device_id: this.selectDevice.video,
            audio_device_id: this.selectDevice.audio,
          },
          transtraction,
          'change_device'
        )
        break
      case 'unpublish': // 撤销本地流的发布 || 关闭摄像头
        var unpublishMsg = { request: 'unpublish' }
        this.pluginHandle.send({ message: unpublishMsg }, transtraction)
        break
      case 'join': // 加入房间
        let { display, id, room } = data
        let register = {
          request: 'join',
          ptype: 'publisher',
          display,
          id,
          room: room,
        }
        this.room = room
        const params = { message: register }

        this.pluginHandle.send(params, transtraction)
        break
      case 'subscribe': // 订阅远程流 每个cef只订阅一个远程
        let { janus_id } = data
        this.subscribeDict[janus_id] = { janus_id, transtraction } // 记录需要订阅的人
        if (!janus_id) {
          this.finishOrder(transtraction, { code: 1, reason: '未提供订阅id' })
          return
        }
        for (let i = 0; i < this.room_participants.length; i++) {
          let { id, video_codec, audio_codec } = this.room_participants[i]
          if (id === janus_id) {
            this.newRemoteFeed(
              this.room,
              janus_id,
              audio_codec,
              video_codec,
              transtraction
            )
            break
          }
        }

        break
      case 'unsubscribe': // 取消订阅远程
        if (this.remoteHandle) {
          this.remoteHandle.detach()
          this.remoteHandle = null

          this.finishOrder(transtraction, { code: 0, reason: 'success' })
        }
        break
      case 'toggle_mute': // 本地静音的切换
        this.toggleMute(data)
        break
      case 'capture': // 截图
        this.captureCanvas(this.videoRef, transtraction)
        break
      case 'configure':
        if (this.pluginHandle) {
          if ('display' in data) {
            this.tid_map[transtraction]['payloadEvent'] = () => {
              this.display = data['display']
              this.displayRef.current.innerText = data['display']
            }
          }
          this.pluginHandle.send(
            { message: { request: 'configure', ...data } },
            transtraction
          )
        }
        break
      default:
        break
    }
  }
  captureImg() {
    this.switchTypeEvent('capture', null, 'capture', 'captureImg')
  }
  // 使用canvas在video上进行截图
  captureCanvas(video, transtraction) {
    if (video) {
      let canvas = document.createElement('canvas')
      let { videoWidth: width, videoHeight: height } = video
      canvas.width = width
      canvas.height = height
      let ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, width, height, 0, 0, width, height)
      let imageType = 'image/png'
      let base64 = canvas.toDataURL(imageType, 0.6)
      Axios.put('https://172.16.1.31:19443/edu_interact/pic_attend', {
        img_b64: base64,
        img_type: imageType,
        class_id: 'b719df013f4f4586bd0acde0da3efb88',
        model_ip: '120.26.89.217',
        rt_img: true,
      })
        .then((res) => {})
        .catch((err) => {})
      this.finishOrder(transtraction, {
        code: 0,
        reason: 'success',
        result: {
          image_data: base64,
          image_width: width,
          image_height: height,
        },
      })
    }
  }
  /**
   * @description 获取设备列表并分类
   * @return {video: [], audio: []}
   */
  listDevices() {
    return new Promise((resolve, reject) => {
      let deviceList = {
        audio: [],
        video: [],
        audio_out: [],
      }
      let audio_group = [],
        video_group = [],
        speaker_group = []
      let filter_video_devices = ['screen-capture-recorder', 'zk_OBS-Camera'] // 根据label排除某些设备
      try {
        navigator.mediaDevices.enumerateDevices().then((list) =>
          list.forEach((device) => {
            let { kind, label, groupId } = device
            if (kind === 'audioinput' && !audio_group.includes(groupId)) {
              deviceList.audio.push(device)
              audio_group.push(groupId)
            } else if (
              kind === 'videoinput' &&
              !filter_video_devices.includes(label) &&
              !video_group.includes(groupId)
            ) {
              deviceList.video.push(device)
              video_group.push(groupId)
            } else if (
              kind === 'audio_output' &&
              !speaker_group.includes(groupId)
            ) {
              deviceList.audio_out.push(device)
              speaker_group.push(groupId)
            }
            resolve(deviceList)
          })
        )
      } catch (error) {
        reject(deviceList)
      }
    })
  }
  /**
   * @description 根据id来去重房间的成员
   * @param {Array} arr 成员列表
   */
  uniquePerson(arr) {
    let obj = {}
    arr.forEach((item) => {
      let { id } = item
      if (!obj[id]) {
        obj[id] = item
      }
    })
    return Object.values(obj)
  }
  /**
   * @description 把离开房间人从成员列表中删除
   * @param {Array} arr 所有的成员列表
   * @param {String} del_id 离开房间人的id
   */
  deletePerson(arr, del_id) {
    let _index
    let copyArr = [].concat(arr)
    for (let i = 0; i < arr.length; i++) {
      let { id } = arr[i]
      if (id === del_id) {
        _index = i
        break
      }
    }
    copyArr.splice(_index, 1)
    return copyArr
  }
  /**
   * @description 根据Janus查找display
   * @param {String} id Janus_id
   */
  findDisplay(janus_id) {
    for (let i = 0; i < this.room_participants.length; i++) {
      const { display, id } = this.room_participants[i]
      if (janus_id === id) {
        return display
      }
    }
  }
  // 初始化Janus链接
  initJanus = () => {
    // let {
    //     c_share_ip,
    //     c_sharp_port,
    //     janus_port,
    //     hostname,
    //     protocol,
    //     type,
    //     audio_device_label,
    //     video_device_label,
    //   } = args,
    //   server = null,
    //   janus = null

    const server = `wss://120.26.89.217:4145`
    let janus = null
    let c_sharp_server_url = `wss://localhost:8899`
    let type = 'local'
    this.initWss(c_sharp_server_url) // 链接c_sharp的server
    Janus.init({
      debug: 'debug',
      callback: () => {
        this.janus = janus = new Janus({
          iceServers:
            this.iceServers && this.iceServers.length > 0
              ? this.iceServers
              : null,
          server,
          success: () => {
            if (type === 'local') {
              // this.loadLocalPluginHandle(audio_device_label, video_device_label)
              this.loadLocalPluginHandle()
            } else if (type === 'remote') {
              this.checkListParticipants()
              this.loadRemotePluginHandle()
            }
          },
        })
      },
    })
  }
  // 此Handle只做为一个观测者的作用 检查所有的成员
  checkListParticipants() {
    let { room } = this
    this.janus.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: 'video-room' + Janus.randomString(12),
      success: (plugin) => {
        this.checkListParticipantsHandle = plugin
        let register = {
          request: 'join',
          ptype: 'publisher',
          display: '旁观者',
          room: room,
        }
        plugin.send({ message: register })
      },
      onmessage: (msg, jsep) => {
        let { error, publishers, videoroom: event, unpublished, id } = msg
        let { subscribeDict, room_participants, type } = this
        let subscribeList = Object.values(subscribeDict) // 需要订阅的人员列表
        if (error) {
          ZkToast.error(error)
        }
        if (event === 'stopped-talking' || event === 'talking') {
        }
        if (event === 'stopped-talking' || event === 'talking') {
          this.talikingStopTalk(event, id)
        }
        if (publishers) {
          let allPerson = [...publishers, ...room_participants]
          this.room_participants = this.uniquePerson(allPerson)
          // 有人加入房间时检查是否需要重新进行订阅
          if (type === 'remote' && subscribeList.length) {
            if (this.room_participants.length) {
              subscribeList.forEach((item) => {
                let { janus_id, transtraction } = item
                for (let i = 0; i < this.room_participants.length; i++) {
                  let { id, video_codec, audio_codec } = this.room_participants[
                    i
                  ]
                  if (janus_id === id) {
                    this.newRemoteFeed(
                      this.room,
                      janus_id,
                      audio_codec,
                      video_codec,
                      transtraction
                    )
                  } else {
                    // 订阅时被订阅人不在房间时需要提示
                    ZkToast.warning(`${janus_id}未加入房间/未发布`, 2)
                  }
                }
              })
            } else {
              // ZkToast.warning(`房间无人暂无法订阅`, 2);
            }
          }
        }
        // changed 直至收到ubscribe才取消订阅
        if (unpublished) {
          // this.room_participants = this.deletePerson(this.room_participants, leaving);\
          if (this.janus_id === unpublished) {
            let display = this.findDisplay(unpublished)
            this.controlSpin(true, `${display}已取消发布视频,等待其重新发布`)
          }
        }
        if (event === 'event') {
          let { display } = msg
          if (display) {
            this.display = display
            this.displayRef.current.innerText = display
          }
        }
      },
    })
  }
  /**
   * @description 设置说话的状态
   * @param {String} talking_status 说话的状态
   */
  talikingStopTalk(talking_status, id) {
    if (this.cefroot.current) {
      let { janus_id } = this
      if (janus_id == id) {
        if (talking_status === 'stopped-talking') {
          this.cefroot.current.setAttribute(
            'style',
            'border: 1px solid #141824'
          )
        } else if (talking_status === 'talking') {
          this.cefroot.current.setAttribute(
            'style',
            'border: 1px solid #fff83f'
          )
        }
      } else {
        this.cefroot.current.setAttribute('style', 'border: 1px solid #141824')
      }
    }
  }
  // 本地流发布 第一次默认选择设备后续由C#指定设备
  loadLocalPluginHandle() {
    let { room, display, janus_id } = this
    this.janus.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: 'video-room' + Janus.randomString(12),
      success: (plugin) => {
        this.pluginHandle = plugin
        this.sendFirstData()
        const params = {
          room: room,
          display: display,
          id: janus_id,
        }
        this.switchTypeEvent(
          'join',
          params,
          'auto_join',
          'loadLocalPluginHandle'
        )
      },
      onmessage: (msg, jsep) => {
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
        if (event === 'stopped-talking' || event === 'talking') {
          this.talikingStopTalk(event, id)
        }
        if (janus === 'hangup') {
          if (reason === 'ICE failed') {
            this.controlSpin(true, 'ICE网络协商失败,请检查ICE配置')
          }
          if (reason === 'Close PC') {
            this.setState({
              stream: null,
            })
            if (this.no_stream_node.current) {
              this.no_stream_node.current.setAttribute(
                'style',
                `background: rgb(20, 24, 36) url(${require('../asset/image/ca_nu.png')}) no-repeat center center;background-size: 176px 130px;`
              )
            }
          }
        }
        if (error) {
          ZkToast.error(error)
          if (transaction in this.tid_map) {
            this.finishOrder(transaction, { code: error_code, reason: error })
          }
        } else {
          console.log('janus收到事件onmessage，给原生回消息finishOrder执行')
          if (transaction in this.tid_map) {
            this.finishOrder(transaction, { code: 0, reason: 'success' })
          }
        }
        if (jsep) {
          this.pluginHandle.handleRemoteJsep({
            jsep: jsep,
          })
        }
        switch (event) {
          case 'joined':
            let { video_device_label, audio_device_label } = this
            // this.switchTypeEvent('publish', {audio: audio_device_label, video: video_device_label}, 'auto_publish')
            if (this.isScreen) {
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
              this.stream = null
            }
            if (leaving === 'ok') {
              this.stream = null
            }
            break
          default:
            break
        }
      },
      iceState: (state) => {},
      onlocalstream: (stream) => {
        if (this.videoRef) {
          try {
            this.videoRef.srcObject = stream
          } catch (e) {}
        }
        this.setState({
          stream,
        })
        let audioTrack = stream.getAudioTracks()
        this.video_muted = true
        // 初始化本地video标识的背景图和样式
        let bgimg = require('../asset/image/volx.png')

        if (this.volume_value.current) {
          this.volume_value.current.setAttribute(
            'style',
            `background:url(${bgimg}) no-repeat center;-webkit-mask-image:none`
          )
        }
        if (audioTrack) {
          this.getVolume(this.pluginHandle)
        }

        let publishCompleteState = ['completed', 'connected']
        let tag = setInterval(() => {
          if (
            this.pluginHandle.webrtcStuff &&
            this.pluginHandle.webrtcStuff.pc &&
            publishCompleteState.includes(
              this.pluginHandle.webrtcStuff.pc.iceConnectionState
            )
          ) {
            this.controlSpin(false, '发布中1234...')
            clearInterval(tag)
          }
        }, 1000)
      },
    })
  }
  // 用于订阅远程
  loadRemotePluginHandle() {
    this.remoteHandle = null
    let { room, janus_id } = this
    if (this.janus) {
      this.janus.attach({
        plugin: 'janus.plugin.videoroom',
        opaqueId: 'video-room' + Janus.randomString(12),
        success: (pluginHandle) => {
          this.remoteHandle = pluginHandle
          this.remoteHandle.simulcastStarted = false
          this.sendFirstData()
          this.switchTypeEvent(
            'subscribe',
            { janus_id },
            'auto_subscribe',
            'loadRemotePluginHandle'
          )
        },
        error: function (error) {
          Janus.error('  -- Error attaching plugin...', error)
        },
        onmessage: (msg, jsep) => {
          let {
            videoroom: event,
            error,
            transaction,
            configured,
            switched,
          } = msg
          if (error) {
            ZkToast.error(error)
          }
          if (transaction === 'simulcast' && event === 'event') {
            let { configured } = msg
            if (configured === 'ok') {
              ZkToast.success('simulcast切换成功')
            }
          }
          if (event) {
            if (event === 'attached') {
              this.isSubscribed = true
              let { display } = msg
              this.display = display // 给订阅创否赋值昵称
              // if (janus_id in this.subscribeDict) {
              //   delete this.subscribeDict[janus_id];
              // }
              this.controlSpin(false)
              this.finishOrder(msg['transaction'], {
                code: 0,
                reason: 'success',
              })
            } else if (event === 'event') {
              if (switched === 'ok') {
                this.controlSpin(false)
              }
            }
          }
          if (jsep) {
            // Answer and attach
            this.remoteHandle.createAnswer({
              jsep: jsep,
              media: {
                audioSend: false,
                videoSend: false,
              },
              success: (jsep) => {
                let body = {
                  request: 'start',
                  room: this.room,
                }
                this.remoteHandle.send({
                  message: body,
                  jsep: jsep,
                })
              },
              error: function (error) {
                Janus.error('WebRTC error:', error)
              },
            })
          }
        },
        webrtcState: function (state, reason) {},
        onremotestream: (stream) => {
          this.controlSpin(false, '正在订阅...')
          let videoTracks = stream.getVideoTracks()
          if (videoTracks) {
            this.setState({
              stream,
            })
          } else {
          }
          let audioTrack = stream.getAudioTracks()
          this.video_muted = false
          if (audioTrack) {
            this.getVolume(this.remoteHandle)
          }
        },
        oncleanup: () => {
          this.remoteHandle.simulcastStarted = false
          this.setState({
            stream: null,
          })
        },
        detach: (a, b, c) => {},
      })
    }
  }
  // 订阅某人
  newRemoteFeed = (room, id, audio, video, transcation) => {
    // let numberTransform = Number(room)
    // room = isNaN(numberTransform) ? room : numberTransform;
    this.controlSpin(true, '正在订阅...', true)
    if (this.remoteHandle) {
      let subscribe = {}
      if (this.isSubscribed) {
        subscribe = {
          request: 'switch',
          feed: id,
        }
      } else {
        subscribe = {
          request: 'join',
          room: room,
          ptype: 'subscriber',
          close_pc: false,
          feed: id,
        }
      }

      if (
        Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
        (video === 'vp9' || (video === 'vp8' && !Janus.safariVp8))
      ) {
        if (video) video = video.toUpperCase()
        subscribe['offer_video'] = false
      }
      this.remoteHandle.videoCodec = video
      this.remoteHandle.send(
        {
          message: subscribe,
        },
        transcation
      )
    }
  }
  // 获取视频信息
  videoResolution = (_) => {
    // 获取带宽值　实时值
    this.videoTimer = setInterval(() => {
      let videoInfo = this.videoInfo
      if (this.videoRef) {
        let { videoWidth, videoHeight } = this.videoRef
        if (this.remoteHandle) {
          let { birate, packLost } = this.remoteHandle.getBitrate()
          videoInfo.innerHTML = `<p>分辨率:<cite>${videoWidth} * ${videoHeight}</cite></p>
          <p> &nbsp;&nbsp;码率:<cite>${birate}</cite></p> <p>&nbsp;&nbsp;丢包数:<cite>${packLost}</cite></p>`
        } else {
          videoInfo.innerHTML = `<p>分辨率:<cite>${videoWidth} * ${videoHeight}</cite></p>`
        }
      }
    }, 1000)
  }
  switchSimulcast(value) {
    this.remoteHandle.send(
      {
        message: {
          request: 'configure',
          substream: value,
        },
      },
      'simulcast'
    )
  }
  changeVideoDevice(video_device_id) {
    this.setState({
      video_device_id,
    })
    this.switchTypeEvent(
      'change_device',
      { video: video_device_id },
      'changeVideoDevice'
    )
    // sthis.publishOwnFeed(this.pluginHandle, true, { video_device_id, audio_device_id }, 'republish');
  }
  /**
   * 获取设备列表
   */
  fetchDevices() {
    this.listDevices()
      .then((res) => {
        // this.setState({
        //   deviceDict: res
        // })
      })
      .catch((err) => {
        ZkToast.error('无法获取设备列表')
      })
  }
  /**
   * @description 自主发布接收label
   * @param {String} audio_device_label 视频采集器的名称
   * @param {String} video_device_label 视频设备的名称
   * @param {String} transcation Janus request uuid
   */
  publishControl(audio_device_label, video_device_label, transcation) {
    this.listDevices()
      .then((res) => {
        let { audio, video } = res
        let selectDevice = {
          audio: null,
          video: null,
        }
        this.setState({
          deviceDict: res,
        })
        if (audio.length && video.length) {
          if (audio_device_label) {
            let audio_id = this.getDeviceId(audio_device_label, audio)
            if (audio_id) {
              selectDevice.audio = audio_id
            } else {
              selectDevice.audio = audio[0].deviceId
            }
          } else {
            selectDevice.audio = audio[0].deviceId
          }

          if (video_device_label) {
            let video_id = this.getDeviceId(video_device_label, video)
            if (video_id) {
              selectDevice.video = video_id
            } else {
              selectDevice.video = video[0].deviceId
            }
          } else {
            selectDevice.video = video[0].deviceId
          }
          this.setState({
            video_device_id: selectDevice.video,
            audio_device_id: selectDevice.audio,
          })
          this.publishOwnFeed(
            this.pluginHandle,
            true,
            false,
            {
              video_device_id: selectDevice.video,
              audio_device_id: selectDevice.audio,
            },
            transcation,
            'publishControl'
          )
        } else {
          ZkToast.warn('设备列表为空')
        }
      })
      .catch((err) => {
        ZkToast.error('无法获取设备列表')
      })
  }
  /**
   *
   * @param {String} label 设备名称
   * @param {Array} deviceList 设备列表
   */
  getDeviceId(label, deviceList) {
    for (let i = 0; i < deviceList.length; i++) {
      const item = deviceList[i]
      if (item.label === label) {
        return item.deviceId
      }
    }
    return null
  }
  /**
   * @description 控制弹层的显示 发布中。。。 已经撤销发布。。。等
   * @param {Boolean} show 是否显示
   * @param {String} text 显示的文本
   */
  controlSpin(show, text, loading = false) {
    let node = this.spinNode.current
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
      image.src = require('../asset/image/loading.svg')
      node.appendChild(image)
    }
  }
  // 以下的函数是测试阶段的函数
  /**
   * 修改Janus的display
   */
  editPublisher() {
    if (this.pluginHandle) {
      this.switchTypeEvent(
        'configure',
        { display: 'aaa', bitrate: 1000000 },
        '修改昵称',
        'editPublisher'
      )
    }
  }
  /**
   * 撤销发布本地流
   */
  unpublishEvent() {
    if (this.pluginHandle) {
      this.switchTypeEvent(
        'unpublish',
        null,
        'unpublish_event',
        'unpublishEvent'
      )
    }
  }
  /**
   * 发布事件
   */
  publishEvent() {
    if (this.pluginHandle) {
      this.switchTypeEvent('publish', {}, 'publish_event', 'publishEvent')
    }
  }
  // 静音本地Video 并替换背景
  muteLocalVideo() {
    if (this.videoRef) {
      let muteStatus = this.videoRef.muted
      this.video_muted = !muteStatus
      clearInterval(this.timer)
      let bgimg = require('../asset/image/volx.png')
      let bgimg_volume = require('../asset/image/volume.svg')
      let volume_node = this.volume_value.current
      if (!muteStatus && volume_node) {
        volume_node.setAttribute(
          'style',
          `background:url(${bgimg}) no-repeat center;-webkit-mask-image:none`
        )
      } else {
        volume_node.setAttribute(
          'style',
          `background:#fff83f;-webkit-mask-image:url(${bgimg_volume})`
        )
      }
      let plugin = this.type === 'local' ? this.pluginHandle : this.remoteHandle
      this.getVolume(plugin)
      this.videoRef.muted = !muteStatus
    }
  }
  leaveRoom() {
    if (this.pluginHandle) {
      let transtraction = uuidv4()
      this.pluginHandle.send({ message: { request: 'leave' } }, transtraction)
    }
  }
  muteRtc = (_) => {
    let { mutedRtc } = this
    let curr_node = this.rtcMicNode.current
    let conf = { audio: true }
    if (!mutedRtc) {
      conf = { audio: false }
      curr_node.setAttribute(
        'style',
        `width: 3px;
                                      height: 25px;
                                      background: #f00;
                                      position: relative;
                                      top: 1px;
                                      left: 50%;
                                      transform: translateX(-54%) rotate(-45deg);`
      )
    } else {
      curr_node.setAttribute(
        'style',
        `width: 9px;
                                      height: 17px;
                                      background:linear-gradient(to top, #fff83f 0%, transparent);
                                      position: relative;
                                      top: 3px;
                                      left: 50%;
                                      transform: translateX(-54%);
                                      border-radius: 5px;`
      )
    }
    if (this.pluginHandle) {
      this.switchTypeEvent('configure', conf, '_toggtermuted_rtc', 'muteRtc')
    }
    this.mutedRtc = !mutedRtc
  }
  render() {
    let { type, display, isScreen, no_stream_node } = this
    let { stream, muted } = this.state
    // let { audio: audioList, video: videoList} = deviceDict;
    return (
      <div className="subscribe" ref={this.cefroot}>
        <div id="spin" ref={this.spinNode}></div>
        {/* <Spin spinning={showSpin} wrapperClassName="subscribe">正在发布...</Spin> */}
        {stream ? (
          <div className="video_container">
            {type != 'local' ? (
              <div className="volumn_value_con">
                {/* <div className="nick_name" ref={this.displayRef}>{display}</div> */}
                <div
                  className="volume_value"
                  ref={this.volume_value}
                  onClick={this.muteLocalVideo.bind(this)}
                ></div>
              </div>
            ) : null}
            <video
              muted={type === 'local' ? true : false}
              crossOrigin="anonymous"
              playsInline
              onCanPlay={(e) => {
                let video = e.target
                video.play()
                this.videoResolution()
              }}
              ref={(video) => {
                this.videoRef = video
                try {
                  video.srcObject = stream
                } catch (e) {}
              }}
            ></video>
            {type === 'local' && !isScreen ? (
              <div className="rtc_mic" onClick={this.muteRtc}>
                <div className="mic_volume" ref={this.rtcMicNode}></div>
              </div>
            ) : null}
            <div
              className="bottom_info"
              ref={(e) => {
                this.videoInfo = e
              }}
            >
              {/* <span className={muted?'muted':null} ref="volume_value"></span> */}
            </div>
          </div>
        ) : (
          <div className="no_stream" ref={no_stream_node}></div>
        )}
      </div>
    )
  }
}

export default SubScribe
