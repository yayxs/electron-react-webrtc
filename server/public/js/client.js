/**
 * 获取dom节点
 */
const videoEle = getEle('#audioSource')
const audioEle = getEle('#videoSource')
const audioOut = getEle('#audioOutputSource')

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.log(`your browser not support  navigator.mediaDevices.getUserMedia`)
} else {
  const constraints = {
    video: true,
    audio: true,
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(getMediaStream)
    .catch(handleError)
}

function getMediaStream(stream) {
  try {
    const player = getEle('#player')
    player.srcObject = stream
  } catch (error) {}
}

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log(`your browser not support`)
} else {
  navigator.mediaDevices
    .enumerateDevices()
    .then(getListDevices)
    .catch(handleError)
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
