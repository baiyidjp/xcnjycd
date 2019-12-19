//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'prod-h4qal',
        traceUser: true,
      })
    }

    this.globalData = {}
  
    // 自定义一个全局对象
    wx.jp = {}

    // 加载toast
    this.initToast()

    // 设备信息
    this.initSystemInfo()

    // openid
    this.getUserIdsInfo()

    // admins
    this.getAdminIds()
  },

  // 封装toast
  initToast: function () {

    wx.jp.loading = (title = '加载中') => {
      wx.showLoading({
        title: title,
        mask: true
      })
    }

    wx.jp.hideLoading = () => {
      wx.hideLoading()
    }

    wx.jp.toast = (title, success = false, duration = 1500) => {

      const obj = {
        title: title,
        duration: duration
      }
      if (!success) {
        obj.icon = 'none'
      }

      wx.showToast(obj)
    }
  },

  // 处理设备信息
  initSystemInfo: function () {
    const systemInfo = wx.getSystemInfoSync()
    console.log(systemInfo)
    wx.jp.statusBarHeight = systemInfo.statusBarHeight
    if (systemInfo.system.indexOf('iOS') != -1) {
      wx.jp.contentBarHeight = 44
      wx.jp.navigationBarHeight = 44 + systemInfo.statusBarHeight
    } else {
      wx.jp.contentBarHeight = 48
      wx.jp.navigationBarHeight = 48 + systemInfo.statusBarHeight
    }
    wx.jp.screenHeight = systemInfo.screenHeight
    wx.jp.windowHeight = systemInfo.windowHeight
  },

  getUserIdsInfo() {

    const userIds = wx.getStorageSync('userIds')
    if (userIds) {
      wx.jp.ids = userIds
      console.log(wx.jp.ids)
    } else {
      wx.cloud.callFunction({
        name: 'login'
      }).then(res => {
        wx.jp.ids = {
          openid: res.result.openid,
          appid: res.result.appid,
          unionid: res.result.unionid
        }
        console.log(wx.jp.ids)
        wx.setStorage({
          key: 'userIds',
          data: wx.jp.ids,
        })
      })
    }
  },

  getAdminIds() {

    const adminIdsCache = wx.getStorageSync('adminIds')
    if (adminIdsCache) {
      wx.jp.adminIds = adminIdsCache
    } 

    wx.cloud.database().collection('admin_list').get().then(res => {
      const adminIds = res.data[0].admins
      wx.jp.adminIds = adminIds
      wx.setStorage({
        key: 'adminIds',
        data: adminIds,
      })
    })
  }

})
