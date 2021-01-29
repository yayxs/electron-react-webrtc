/**
 * 获取dom节点
 */
const audioEle = getEle('#audioSource')
const videoEle = getEle('#videoSource')
const audioOut = getEle('#audioOutputSource')

function start(params) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log(`your browser not support  navigator.mediaDevices.getUserMedia`)
  } else {
    const constraints = {
      video: {
        width: 400,
        height: 300,
        frameRate: 30, // 帧率
      }, // 是否视频
      audio: {}, // 是否音频
    }
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(getMediaStream)
      .then(getListDevices)
      .catch(handleError)
  }
}
/**
 * 加载
 */
start()
videoEle.onchange = () => {
  console.log(123)
}
function getMediaStream(stream) {
  // 同意访问音视频数据
  try {
    const player = getEle('#player')
    player.srcObject = stream
    // 获取视频流成功之后然后创建设备选择
    return navigator.mediaDevices.enumerateDevices()
  } catch (error) {}
}

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log(`your browser not support`)
} else {
  // navigator.mediaDevices
  //   .enumerateDevices()
  //   .then(getListDevices)
  //   .catch(handleError)
}
/**
 * 设备分组
 * @param {*} deviceInfos
 */
function getListDevices(deviceInfos) {
  const sortList = handleGrouping(deviceInfos)
  console.log(sortList)
}
/**
 * 获取列表的错误处理
 * @param {*} err
 */
function handleError(err) {
  console.log(err)
}
/**
 * 设备分组
 * @param {*} devices
 */
function handleGrouping(devices) {
  let deviceList = {
      video: [],
      audio: [],
      audioOut: [],
    },
    videoDeviceIdGroup = [],
    audioDeviceIdGroup = [],
    audioDeviceIdOutGroup = []

  devices.forEach((device) => {
    const { deviceId, kind, label, groupId } = device

    const option = document.createElement('option')
    option.text = label
    option.value = deviceId
    if (kind === 'audioinput' && !audioDeviceIdGroup.includes(groupId)) {
      deviceList.audio.push(device)
      audioDeviceIdGroup.push(groupId)
      audioEle && audioEle.appendChild(option)
    } else if (kind === 'videoinput' && !videoDeviceIdGroup.includes(groupId)) {
      deviceList.video.push(device)
      videoDeviceIdGroup.push(groupId)
      videoEle && videoEle.appendChild(option)
    } else if (
      kind === 'audiooutput' &&
      !audioDeviceIdOutGroup.includes(groupId)
    ) {
      deviceList.audioOut.push(device)
      audioDeviceIdOutGroup.push(groupId)
      audioOut && audioOut.appendChild(option)
    } else if (
      kind === 'videooutput' &&
      !audioDeviceIdOutGroup.includes(groupId)
    ) {
    }
  })

  return deviceList
}
/**
 * 获取dom 节点
 */
function getEle(selectStr) {
  return document.querySelector(selectStr)
}

function name(params) {}
