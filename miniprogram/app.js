//app.js

const launch = require('/managers/launch.js')

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
  
    // 加载 启动 数据
    launch.getLaunchData()

  }
})
