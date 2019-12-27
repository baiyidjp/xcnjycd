// miniprogram/pages/home/home.js

const roomListCollection = wx.cloud.database().collection('room_list')
const flagListCollection = wx.cloud.database().collection('flag_list')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdmin: false,
    scrollViewHeight: '0px',
    roomList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const scrollViewHeight = `${wx._device.windowHeight - wx._device.navigationBarHeight - 130}px`
    this.setData({scrollViewHeight})

    // 延迟1秒判断是否是admin,让数据请求完
    setTimeout(() => {
      this.setData({
        isAdmin: wx._data.isAdmin
      })
    },1000)
  },

  onShow: function () {
    // 请求数据
    this.requestData()
  },

  requestData() {

    wx._load.show()
    // 获取房间列表
    wx.cloud.callFunction({
      name: 'room-list'
    }).then(res => {
      const roomList = res.result.data.map(room => {
        // 包间的状态 0-没有客人 1-有客人 2-有预定
        room.roomBack = `room-back-${room.status}`
        room.nameStyle = `room-name-${room.status}`
        return room
      })
      this.setData({ roomList })
      wx._load.hide()
    }).catch(err => {
      console.log(err)
      wx._load.hide()
    })
  },

  // 点击房间
  roomClick(event) {
    const index = event.currentTarget.dataset.index
    const room = this.data.roomList[index]
    if (room.status == 0) {
      wx.navigateTo({
        url: `/pages/menu-list/menu-list?id=${room.id}`,
      })
    } else {
      wx._toast.show('当前已有客人,请您选择其他房间')
    }
  },

  // 获取订阅消息权限
  subscribeClick() {
    if (this.data.isAdmin) {
      wx.requestSubscribeMessage({
        tmplIds: ['hYtLok-Zolqoz1Nd9iTM9q3cfV6jF-WhA3WyT5XMyiU'],
        success(res) {
          wx._toast.show('订阅消息成功')
        },
        fail(err) {
          console.log(err)
        }
      })
    }
  }
})