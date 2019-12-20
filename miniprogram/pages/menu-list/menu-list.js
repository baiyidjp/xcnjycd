// miniprogram/pages/menu-list/menu-list.js
const menuListCollection = wx.cloud.database().collection('menu_list')
const flagListCollection = wx.cloud.database().collection('flag_list')
const orderListCollection = wx.cloud.database().collection('order_list')
const roomListCollection = wx.cloud.database().collection('room_list')

const util = require('../../utils/util.js')

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
    isAdmin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const bottom = wx.jp.screenHeight >= 812 ? 34 : 0
    const scrollViewHeight = `${wx.jp.screenHeight - wx.jp.navigationBarHeight - bottom}px`
    this.setData({ 
      scrollViewHeight
    })
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
    let menuName = this.data.cartList.reduce((oldValue, newValue) => {
      return oldValue + newValue.title + '*' + newValue.count + ', '
    }, '')
    menuName = menuName.substring(0, menuName.length - 2)
    let menuName1 = menuName
    let menuName2 = '已下单(点击查看详情)'
    if (menuName.length > 20) {
      // 字符串最多20字
      menuName1 = menuName.substring(0, 19)
    }
    // 时间
    const orderTime = util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
    const timeString = util.formatDate(new Date(), 'yyyyMMddhhmmss')
    // 用户的openid
    const openId = wx.jp.ids.openid
    // 订单编号
    const orderCode = `${timeString}${util.getRandomIntInclusive(100000,999999)}`

    const message = {
      touser: 'oqia25M2AS3evEc0GfI3OoHxeQtM',
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
          value: event.detail + '元'
        },
        thing5: {
          value: menuName2
        }
      },
      templateId: 'hYtLok-Zolqoz1Nd9iTM9q3cfV6jF-WhA3WyT5XMyiU'
    }
    console.log(message)
    wx.cloud.callFunction({
      name: 'send-message',
      data: {
        message
      }
    }).then(res => {
      wx.jp.toast('订单提交成功')
      // 上传订单
      this.updateOrder(orderCode, event.detail, orderTime)
      // 更新房间状态
      this.updateRoomStatus()
      // 提交成功 清空购物车
      this.removeCartList()

    }).catch(err => {
      console.log(err)
      wx.jp.toast('订单提交失败')
    })
  },

  // 上传订单
  updateOrder(orderCode, totalPrice, date) {
    const order = {}
    order.orderCode = orderCode
    order.totalPrice = totalPrice
    order.menuList = this.data.cartList
    order.room = this.data.room.name
    order.date = date
    orderListCollection.add({
      data: order
    }).then(res => {
      console.log('下单成功')
    }).catch(err => {
      console.log(err)
    })
  },

  // 更新房间状态
  updateRoomStatus() {
    roomListCollection.doc(this.data.room._id).update({
      data: {
        status: 1
      }
    }).then(res => {
      console.log('房间状态更新成功',res)
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
      return wx.cloud.downloadFile({
        fileID
      })
    }).then(res => {
      wx.jp.hideLoading()
      const filePath = res.tempFilePath
      return wx.saveImageToPhotosAlbum({
        filePath
      })
    }).then(() => {
      wx.jp.toast('保存成功')
    }).catch(err => {
      console.log(err)
      wx.jp.hideLoading()
    })
  }
})