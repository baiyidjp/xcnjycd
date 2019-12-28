// 获取scrollView的高度
export function getScrollViewHeight() {
  const scrollViewHeight = `${wx._device.windowHeight - wx._device.navigationBarHeight - 130}px`
  return scrollViewHeight
}

export function getHomeListData() {
  wx._load.show()
  // 获取房间列表
  return wx.cloud.callFunction({
    name: 'room-list'
  }).then(res => {
    const roomList = res.result.data.map(room => {
      // 包间的状态 0-没有客人 1-有客人 2-有预定
      room.roomBack = `room-back-${room.status}`
      room.nameStyle = `room-name-${room.status}`
      return room
    })
    wx._load.hide()
    // 返回数据
    return roomList

  }).catch(err => {
    console.log(err)
    wx._load.hide()
  })
}