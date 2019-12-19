// miniprogram/pages/home/home.js

const roomListCollection = wx.cloud.database().collection('room_list')
const flagListCollection = wx.cloud.database().collection('flag_list')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    roomList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const scrollViewHeight = `${wx.jp.windowHeight - wx.jp.navigationBarHeight - 130}px`
    this.setData({scrollViewHeight})

    this.requestData()
  },

  requestData() {

    wx.jp.loading()
    // 获取房间列表
    roomListCollection.orderBy('id', 'asc').get().then(res => {
      const roomList = res.data.map(room => {
        room.backStyle = `room-back-${room.status}`
        room.nameStyle = `room-name-${room.status}`
        room.statusString = room.status == 0 ? '空包间' : (room.status == 1 ? '已上桌' : '已预订')
        return room
      })
      this.setData({ roomList })
      wx.jp.hideLoading()
    }).catch(err => {
      console.log(err)
      wx.jp.hideLoading()
    })
  },

  roomClick(event) {
    const index = event.currentTarget.dataset.index
    const room = this.data.roomList[index]
    wx.navigateTo({
      url: `/pages/menu-list/menu-list?id=${room.id}&name=${room.name}&status=${room.status}&_id=${room._id}`,
    })
    // if (room.status == 0) {
    //   wx.navigateTo({
    //     url: `/pages/menu-list/menu-list?id=${room.id}&name=${room.name}&status=${room.status}&_id=${room._id}`,
    //   })
    // } else {
    //   wx.jp.toast(`房间${room.statusString}`)
    // }
  },

  avatarClick() {
    // 获取权限
    if (wx.jp.ids.openid == 'oqia25M2AS3evEc0GfI3OoHxeQtM' || wx.jp.ids.openid == 'oqia25DMJ1PZG8NbBQnF_E3JWpaQ' || wx.jp.ids.openid == 'oqia25IvOfQ9ZoJMoDz3BL9tr1kk') {
      wx.requestSubscribeMessage({
        tmplIds: ['hYtLok-Zolqoz1Nd9iTM9q3cfV6jF-WhA3WyT5XMyiU'],
        success(res) {
          console.log('订阅成功')
        }
      })
    }
  }

})