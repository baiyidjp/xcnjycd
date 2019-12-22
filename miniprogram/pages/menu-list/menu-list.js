// miniprogram/pages/menu-list/menu-list.js
const menuListCollection = wx.cloud.database().collection('menu_list')
const flagListCollection = wx.cloud.database().collection('flag_list')
const orderListCollection = wx.cloud.database().collection('order_list')
const roomListCollection = wx.cloud.database().collection('room_list')

const util = require('../../utils/util.js')

const location_url = 'https://restapi.amap.com/v3/assistant/coordinate/convert?coordsys=gps&key=b68c82c0b447cfd84bbb8dc960179c24&locations='

const fence_url = 'https://restapi.amap.com/v4/geofence/status?key=b68c82c0b447cfd84bbb8dc960179c24&diu=583D2BB0-B19C-4A9A-A600-2A1EB2FB7E39&locations='

const fence_gid = '0910ae70-c2cd-4bac-a4ae-6aee9b8eccbf'
const locationToast = '检测到您未在饭店,请在饭店下单'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    room: {},
    scrollViewHeight: '0px',
    dataList: [],
    currentIndex: 0,
    cartList: [],
    isShowCartList: false,
    isAdmin: false,
    totalPrice: 0, 
    orderAlertShow: false,
    miniCodeAlertShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    miniCodeFileID: '',
    miniCodeTempFilePath: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const bottom = wx.jp.screenHeight >= 812 ? 34 : 0
    const scrollViewHeight = `${wx.jp.screenHeight - wx.jp.navigationBarHeight - bottom}px`
    this.setData({ scrollViewHeight})
    // 获取房间数据
    roomListCollection.where({
      id: parseInt(options.id)
    }).get().then(res => {
      const room = res.data[0]
      this.setData({room})
    })

    // 判断是否是admin
    const openid = wx.jp.ids.openid
    const adminIds = wx.jp.adminIds
    if (adminIds.find(id => id == openid)) {
      this.setData({
        isAdmin: true
      })
    } else {
      this.setData({
        isAdmin: false
      })
    }

    this.requestData()
  },

  requestData() {

    wx.jp.loading()

    // 是否有新的数据需要更新
    this.getFlagList().then(isRefreshData => {
      if (isRefreshData) {
        this.getLatestData()
      } else {
        this.getCacheData()
      }
    })
  },

  // 获取最新的数据
  getLatestData() {
    menuListCollection.orderBy('id', 'asc').get().then(res => {
      const dataList = res.data
      this.setData({ dataList })
      // 保存数据到本地
      wx.setStorage({
        key: 'menu-list',
        data: dataList,
      })
      wx.jp.hideLoading()
    }).catch(() => {
      wx.jp.hideLoading()
    })
  },

  // 获取缓存数据
  getCacheData() {
    // 先查看是否有缓存
    const dataCache = wx.getStorageSync('menu-list')
    if (dataCache) {
      this.setData({
        dataList: dataCache
      })
      wx.jp.hideLoading()
    } else {
      this.getLatestData()
    }
  },

  // 获取一些标识
  getFlagList() {
    const flagListCache = wx.getStorageSync('flag-list')
    return new Promise(resolve => {
      flagListCollection.get({
        success: res => {
          if (res.data.length > 0) {
            const flag_list = res.data[0]
            if (flagListCache) {
              if (flag_list.menuListVersion > flagListCache.menuListVersion) {
                // 有新版本数据 更新并保存
                resolve(true)
                wx.setStorage({
                  key: 'flag-list',
                  data: flag_list,
                })
              } else {
                // 版本一致  不需要更新
                resolve(false)
              }
            } else {
              // 没有flag的缓存 需要更新数据
              resolve(true)
              wx.setStorage({
                key: 'flag-list',
                data: flag_list,
              })
            }
          }
        },
        fail: err => {
          resolve(false)
        }
      })
    })
  },

  categoryClick(event) {
    const currentIndex = event.detail
    this.setData({ currentIndex })
  },

  // 添加商品到购物车
  addFoodToCartList(event) {
    const data = event.detail
    // 是否传过来商品
    if (data) {
      // 是否已经存在购物车中
      const cartList = this.data.cartList
      const findItem = cartList.find(item => {
        return data.id == item.id
      })

      // 取出列表的对应数据
      const dataList = this.data.dataList
      const menuList = dataList[this.data.currentIndex]
      const findMenuItem = menuList.items.find(item => {
        return item.id == data.id
      })

      if (findItem) {
        // 存在商品 数量+1
        findItem.count += 1
        findMenuItem.count += 1
      } else {
        // 不存在 加入购物车
        data.count = 1
        cartList.push(data)
        if (findMenuItem) {
          findMenuItem.count = 1
        }
      }
      this.setData({ cartList })

      dataList[this.data.currentIndex] = menuList
      this.setData({ dataList })
    }
  },

  // 移除选中的数量
  removeFoodFromCartList(event) {
    const data = event.detail
    // 是否传过来商品
    if (data) {
      // 是否已经存在购物车中
      const cartList = this.data.cartList
      const findItem = cartList.find(item => {
        return data.id == item.id
      })

      if (findItem) {
        // 存在商品 数量-1
        findItem.count -= 1

        // 取出列表的对应数据
        const dataList = this.data.dataList
        const menuList = dataList[this.data.currentIndex]
        const findMenuItem = menuList.items.find(item => {
          return item.id == findItem.id
        })
        // 列表数据 -1
        findMenuItem.count -= 1
        dataList[this.data.currentIndex] = menuList
        this.setData({ dataList })

      }
      if (findItem.count <= 0) {
        cartList.splice(cartList.indexOf(findItem), 1)
      }
      this.setData({ cartList })

      // 如果购物车被清空 则隐藏购物车列表
      if (cartList.length <= 0) {
        this.setData({
          isShowCartList: false
        })
      }
    }
  },

  // 点击购物车图标
  cartClick() {
    const isShowCartList = !this.data.isShowCartList
    this.setData({ isShowCartList })
  },

  // 下单
  orderClick(event) {

    // 判断是否在饭店周围
    this.isNearby().then(res => {
      if (res) {
        // 记录总价 展示弹窗
        this.setData({
          orderAlertShow: true,
          totalPrice: event.detail
        })
      } else {
        wx.jp.toast(locationToast)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  // 弹窗点击
  tapOrderButton(e) {

    // 设置弹窗消失
    this.setData({
      orderAlertShow: false
    })

    // 判断是否点击了确定
    if (e.detail.index == '1') {

      // 判断购物车数据是否正常
      const cartList = this.data.cartList
      if (cartList.length <= 0) {
        wx.jp.toast('数据错误,重新选择')
        this.removeCartList()
        return
      }
      // 时间
      const date = new Date()
      const timeString = util.formatDate(date, 'yyyyMMddhhmmss')
      // 用户的openid
      const openId = wx.jp.ids.openid
      // 订单编号
      const orderCode = `${timeString}${util.getRandomIntInclusive(100000, 999999)}`

      // 上传订单
      this.updateOrder(orderCode, date).then(res => {
        wx.jp.toast('订单提交成功')
        // 发送订阅消息
        this.sendMessage(orderCode)
        // 更新房间状态
        this.updateRoomStatus()
        // 提交成功 清空购物车
        this.removeCartList()
      }).catch(err => {
        console.log(err)
        wx.jp.toast('订单提交失败')
      })
    }
  },

  // 上传订单
  updateOrder(orderCode, date) {
    const order = {}
    order.orderCode = orderCode
    order.totalPrice = this.data.totalPrice
    order.menuList = this.data.cartList
    order.room = this.data.room
    order.date = date.getTime()
    // 订单的状态 0-上菜中 1-已取消 2-已完成
    order.status = 0
    return orderListCollection.add({
      data: order
    })
  },

  // 更新房间状态
  updateRoomStatus() {
    wx.cloud.callFunction({
      name: 'room-status',
      data: {
        status: 1,
        _id: this.data.room._id
      }
    }).then(res => {
      console.log('房间状态更改成功',1)
    }).catch(err => {
      console.log(err)
    })
  },

  // 清空购物车
  removeCartList() {
    
    const dataList = this.data.dataList.map(data => {
      data.items.map(item => {
        item.count = 0
        return item
      })
      return data
    })

    this.setData({
      isShowCartList: false,
      cartList: [],
      dataList
    })
  },

  // 发送订阅消息
  sendMessage(orderCode) {

    const cartList = this.data.cartList
    // 获取订单的信息
    let menuName1 = cartList[0].title + ` 等共${cartList.length}个菜`
    let menuName2 = '已下单(点击查看详情)'

    // 组装订阅消息
    const message = {
      page: `/pages/order-detail/order-detail?orderCode=${orderCode}`,
      data: {
        // 订单编号
        character_string1: {
          value: orderCode
        },
        // 台号
        thing2: {
          value: this.data.room.name
        },
        // 菜品
        thing3: {
          value: menuName1
        },
        // 价格
        amount4: {
          value: this.data.totalPrice + '元'
        },
        thing5: {
          value: menuName2
        }
      },
      templateId: 'hYtLok-Zolqoz1Nd9iTM9q3cfV6jF-WhA3WyT5XMyiU'
    }

    // 循环admin
    const adminIds = wx.jp.adminIds
    if (adminIds.length) {
      for (const adminId of adminIds) {
        message.touser = adminId
        this.sendMessageWithCloudFunc(message)
      }
    } else {
      // 写死 ba
      message.touser = 'oqia25OBQaq1xnaGeLiTaThQkkSw'
      this.sendMessageWithCloudFunc(message)
    }
    

  },

  // 调用云函数发送消息
  sendMessageWithCloudFunc(message) {
    console.log(message)
    wx.cloud.callFunction({
      name: 'send-message',
      data: {
        message
      },
      complete: res => {
        console.log('send-meesage result: ', res)
      }
    })
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
  },

  // 生成二维码
  miniCode() {

    wx.jp.loading('获取二维码')
    wx.cloud.callFunction({
      name: 'minicode',
      data: {
        path: 'pages/menu-list/menu-list?id=' + this.data.room.id,
        roomNumber: this.data.room.name
      }
    }).then(res => {
      console.log(res.result)
      const fileID = res.result.fileID
      this.setData({
        miniCodeFileID: fileID
      })
      return wx.cloud.downloadFile({
        fileID
      })
    }).then(res => {
      wx.jp.hideLoading()
      this.setData({
        miniCodeAlertShow: true,
        miniCodeTempFilePath: res.tempFilePath
      })
    }).catch(err => {
      console.log(err)
      wx.jp.hideLoading()
    })
  },

  // 下载图片的确认
  tapMiniCodeButton(event) {
    // 设置弹窗消失
    this.setData({
      miniCodeAlertShow: false
    })
    // 判断是否点击了确定
    if (event.detail.index == '1') {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.miniCodeTempFilePath,
        success: () => {
          wx.jp.toast(this.data.room.name + '的二维码保存成功') 
          wx.cloud.deleteFile({
            fileList: [this.data.miniCodeFileID]
          })
        },
        fail: err => {
          console.log(err)  
        }
      })
    }
  },

  // 判断下单人是否在饭店周围
  isNearby() {
    return new Promise((resolve, reject) => {
      // 先判断用户是否拒绝了
      wx.getSetting({
        success: res => {
          const userLocation = res.authSetting['scope.userLocation']
          if (userLocation && !userLocation) {
            wx.jp.toast('请点击右上角三点,打开设置,允许使用位置')
            reject('请点击右上角三点,打开设置,允许使用位置')
          } else {
            resolve(res)
          }
        },
        fail: err => {
          console.log(err)
          reject(err)
        }
      })
    }).then(res => {
      // 请求位置经纬度
      return new Promise((resolve, reject) => {
        wx.getLocation({
          success: res => {
            resolve(res)
          },
          fail: err => {
            console.log(err)
            wx.jp.toast('请点击右上角三点,打开设置,允许使用位置')
          }
        })
      }).then(res => {
        const location = `${res.longitude},${res.latitude}`
        console.log(location)
        // 转成高德坐标系
        return new Promise((resolve, reject) => {
          wx.request({
            url: location_url + location,
            success: function (res) {
              resolve(res)
            },
            fail: function (err) {
              reject(err)
            }
          })
        })
      }).then(res => {
        const locations = `${res.data.locations},${parseInt(new Date().getTime() / 1000)}`
        const url = fence_url + locations
        console.log(locations)
        // 使用高德地图判断是否在饭店周围
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            success: function (res) {
              resolve(res)
            },
            fail: function (err) {
              reject(err)
            }
          })
        })
      }).then(res => {
        console.log(res)
        const list = res.data.data.fencing_event_list
        return new Promise((resolve, reject) => {
          if (list) {
            const fence = list.find(fence => {
              return fence.fence_info.fence_gid = fence_gid
            })
            if (fence) {
              const isIn = fence.client_status == 'in'
              resolve(isIn)
            } else {
              wx.jp.toast(locationToast)
              reject(locationToast)
            }
          } else {
            wx.jp.toast(locationToast)
            reject(locationToast)
          }
        })
      })
    })
  }

})