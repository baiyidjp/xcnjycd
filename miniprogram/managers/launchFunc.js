export function getLaunchData() {

  // 全局数据对象
  wx._data = {
    openid: '',
    admins: [],
    isAdmin: false
  }
  // 获取 openid
  const openidCache = wx.getStorageSync('openid')
  if (openidCache) {
    wx._data.openid = openidCache
    console.log(`openidCache: ${openidCache}`)
  } else {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
        const userIds = res.result
        if (userIds) {
          const openid = userIds.openid
          wx._data.openid = openid
          wx.setStorage({
            key: 'openid',
            data: openid,
          })
          console.log(`openid: ${openid}`)
          // 判断是否是Admin
          isAdmin()
        }
    })
  }
  // 获取 admins
  const adminsCache = wx.getStorageSync('admins')
  if (adminsCache) {
    wx._data.admins = adminsCache
    // 判断是否是admin
    isAdmin()
  } 
  // admins 数据需要最新的
  wx.cloud.database().collection('admin_list').get().then(res => {
    const admins = res.data[0].admins
    wx._data.admins = admins
    wx.setStorage({
      key: 'admins',
      data: admins,
    })
    console.log('admins:', admins)
    // 判断是否是admin
    isAdmin()
  })

  // 全局的load对象
  wx._load = {

    // 展示 loading
    show: (title = '加载中') => {
      wx.showLoading({
        title: title,
        mask: true
      })
    },
      // 隐藏 loading
    hide : () => {
      wx.hideLoading()
    }
  }

  // 全局的toast对象
  wx._toast = {

    // 展示 toast
    show: (title, success = false, duration = 1500) => {

      const obj = {
        title: title,
        duration: duration
      }
      if (!success) {
        obj.icon = 'none'
      }
  
      wx.showToast(obj)
    },

    showDelay: (title, success = false, duration = 1500, delay = 200) => {

      const obj = {
        title: title,
        duration: duration
      }
      if (!success) {
        obj.icon = 'none'
      }

      setTimeout(() => {
        wx.showToast(obj)
      }, delay)
    }
  }

  // 全局的设备信息
  wx._device = {
    // 状态栏的高度
    statusBarHeight: 0,
    // 导航栏的内容高度
    contentBarHeight: 0,
    // 导航栏的整体高度
    navigationBarHeight: 0,
    // 整个手机屏幕的高度
    screenHeight: 0,
    // 手机展示内容的高度
    windowHeight: 0,
    // 是否是iPhoneX
    iPhoneX: false
  }
  // 获取当前的设备信息
  const systemInfo = wx.getSystemInfoSync()
  console.log(systemInfo)
  wx._device.statusBarHeight = systemInfo.statusBarHeight
  // 如果是iOS设备
  if (systemInfo.system.indexOf('iOS') != -1) {
    wx._device.contentBarHeight = 44
    wx._device.navigationBarHeight = 44 + systemInfo.statusBarHeight
    if (systemInfo.screenHeight >= 812) {
      wx._device.iPhoneX = true
      wx._device.bottom = 34
    } else {
      wx._device.iPhoneX = false
      wx._device.bottom = 0
    }
  } else {
    wx._device.iPhoneX = false
    wx._device.bottom = 0
    wx._device.contentBarHeight = 48
    wx._device.navigationBarHeight = 48 + systemInfo.statusBarHeight
  }
  wx._device.screenHeight = systemInfo.screenHeight
  wx._device.windowHeight = systemInfo.windowHeight
}

function isAdmin() {
  // 判断是否是admin
  if (wx._data.admins && wx._data.openid) {
    if (wx._data.admins.indexOf(wx._data.openid) != -1) {
      wx._data.isAdmin = true
    } else {
      wx._data.isAdmin = false
    }
  } else {
    wx._data.isAdmin = false
  }
  console.log('isAdmin:', wx._data.isAdmin);
}