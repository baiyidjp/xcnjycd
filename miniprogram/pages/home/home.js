// miniprogram/pages/home/home.js

const homeFunc = require('../../managers/homeFunc.js')

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

    this.setData({
      scrollViewHeight: homeFunc.getScrollViewHeight()
    })

    // 延迟1秒判断是否是admin,让数据请求完
    setTimeout(() => {
      this.setData({
        isAdmin: wx._data.isAdmin
      })
    },1000)
  },

  onShow: function () {
    // 请求数据
    homeFunc.getHomeListData().then(res => {
      const roomList = res
      this.setData({ roomList })
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
        tmplIds: ['sv_YhkOW9GtdMDvfAurl0Qc6RxK3qO58SZ1mN0uGOAU'],
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