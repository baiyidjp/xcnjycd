const menuListCollection = wx.cloud.database().collection('menu_list')
const flagListCollection = wx.cloud.database().collection('flag_list')
const orderListCollection = wx.cloud.database().collection('order_list')
const roomListCollection = wx.cloud.database().collection('room_list')

const util = require('../utils/util.js')

const location_url = 'https://restapi.amap.com/v3/assistant/coordinate/convert?coordsys=gps&key=b68c82c0b447cfd84bbb8dc960179c24&locations='

const fence_url = 'https://restapi.amap.com/v4/geofence/status?key=b68c82c0b447cfd84bbb8dc960179c24&diu=583D2BB0-B19C-4A9A-A600-2A1EB2FB7E39&locations='

const fence_gid = '8691c23e-9c57-4315-8770-3e93132588d8'
const locationToast = '检测到您未在饭店,请在饭店内下单'

// 获取scrollView的高度
export function getScrollViewHeight() {
    const scrollViewHeight = `${wx._device.screenHeight - wx._device.navigationBarHeight - wx._device.bottom}px`
    return scrollViewHeight
}

// 获取房间数据 传入 房间 id
export function getHomeData(id) {
  return roomListCollection.where({
        id: parseInt(id)
    }).get().then(res => {
      const room = res.data[0]
      if (room) {
        if (room.status == 0) {
            return room
        } else {
          wx._toast.show('当前包间已有客人,请您选择其他包间')
          // 延迟退出到首页
          setTimeout(() => {
              wx.switchTab({
                  url: '/pages/home/home'
              })
          }, 1500)
          return 0
        }
      }
    })
}

/* 菜单数据 */

// 获取最新的菜单数据
export function getMenuData() {
  wx._load.show()
  return new Promise(resolve => {
    // 是否有新的数据需要更新
    getFlagVersion().then(isRefresh => {
      resolve(isRefresh)
    })
  }).then(isRefresh => {
    if (isRefresh) {
      return getLatestData()
    } else {
      return getCacheData()
    }
  })
}

// 获取标识 是否要刷新菜单数据
function getFlagVersion() {
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
        // 接口失败 重新拉菜单数据
        resolve(true)
      }
    })
  })
}

// 获取最新的数据
function getLatestData(resolve) {
  return menuListCollection.orderBy('id', 'asc').get().then(res => {
    const dataList = res.data
    // 保存数据到本地
    wx.setStorage({
      key: 'menu-list',
      data: dataList,
    })
    wx._load.hide()
    // 返回数据
    return dataList
  }).catch(() => {
    wx._load.hide()
  })
}

// 获取缓存数据
function getCacheData(resolve) {
  return new Promise(resolve => {
    // 先查看是否有缓存
    const dataCache = wx.getStorageSync('menu-list')
    if (dataCache) {
      wx._load.hide()
      // 返回缓存的数据
      resolve(dataCache)
    } else {
      return getLatestData()
    }
  })
}

/* 购物车的操作 */

// 添加商品到购物车 入参: 用户操作的food(菜), 菜单的列表, 购物车列表, 当前选中的菜单分类index
export function addFood(food, dataList, cartList, currentIndex) {
  // 商品数据存在才进行操作
  if (food) {
    // 在购物车中查询当前选中的food
    const findItem = cartList.find(item => {
      return food.id == item.id
    })

    // 取出分类的对应菜单数据
    const menuList = dataList[currentIndex]
    // 在菜单中找个当前选中的food
    const findMenuItem = menuList.items.find(item => {
      return food.id == item.id
    })

    if (findItem) {
      // 存在商品 数量+1
      findItem.count += 1
      findMenuItem.count += 1
    } else {
      // 不存在 加入购物车
      food.count = 1
      cartList.push(food)
      if (findMenuItem) {
        findMenuItem.count = 1
      }
    }

    dataList[currentIndex] = menuList

    return {
      cartList,
      dataList
    }
  }
}

// 购物车中移除商品 入参: 用户操作的food(菜), 菜单的列表, 购物车列表, 当前选中的菜单分类index
export function removeFood(food, dataList, cartList, currentIndex) {
  // 商品数据存在才进行操作
  if (food) {
    // 在购物车中查询当前选中的food
    const findItem = cartList.find(item => {
      return food.id == item.id
    })

    if (findItem) {
      // 存在商品 数量-1
      findItem.count -= 1

      // 取出列表的对应数据
      const menuList = dataList[currentIndex]
      const findMenuItem = menuList.items.find(item => {
        return item.id == findItem.id
      })
      // 列表数据 -1
      findMenuItem.count -= 1
      dataList[currentIndex] = menuList

      // 查询商品数量是否已经为0, 为0则从购物车移除
      if (findItem.count <= 0) {
        cartList.splice(cartList.indexOf(findItem), 1)
      }
      return {
        cartList,
        dataList
      }
    }
  }
}

/* 下单 */

// 判断下单人是否在饭店周围
export function isNearby() {
  return new Promise((resolve, reject) => {
    // 先判断用户是否拒绝了
    wx.getSetting({
      success: res => {
        const userLocation = res.authSetting['scope.userLocation']
        if (userLocation && !userLocation) {
          wx._toast.showDelay('请点击右上角三点,打开设置,允许使用位置')
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
          reject(err)
          wx._toast.showDelay('请点击右上角三点,打开设置,允许使用位置')
        }
      })
    }).then(res => {
      console.log(res)
      const location = `${res.longitude},${res.latitude}`
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
      console.log(res)
      const locations = `${res.data.locations},${parseInt(new Date().getTime() / 1000)}`
      const url = fence_url + locations
      console.log(url)
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
            reject(locationToast)
            wx._toast.showDelay(locationToast)
          }
        } else {
          reject(locationToast)
          wx._toast.showDelay(locationToast)
        }
      })
    })
  })
}

// 上传订单 入参: 购物车总价, 购物车列表, 包间对象
export function uploadOrder(totalPrice, cartList, room) {

  // 判断购物车数据是否正常
  if (cartList.length <= 0) {
    wx._toast.show('数据错误,重新选择')
    this.removeCartList()
    return
  }

  // 时间
  const date = new Date()
  const timeString = util.formatDate(date, 'yyyyMMddhhmmss')
  // 订单编号
  const orderCode = `${timeString}${util.getRandomIntInclusive(100000, 999999)}`
  // 上传订单
  const order = {}
  order.orderCode = orderCode
  order.totalPrice = totalPrice
  order.menuList = cartList
  order.room = room
  order.date = date.getTime()
  // 订单的状态 0-上菜中 1-已取消 2-已完成
  order.status = 0
  return orderListCollection.add({
    data: order
  }).then(() => {
    // 发送订阅消息
    sendMessage(orderCode, cartList, room, totalPrice)
    // 更改包间状态
    updateRoomStatus(room)
  })
}

// 发送订阅消息 入参: 订单号, 购物车列表, 包间对象, 总价
function sendMessage(orderCode, cartList, room, totalPrice) {
  // 获取订单的信息
  let menuName1 = cartList[0].title + ` 等共${cartList.length}个菜`
  let menuName2 = '已下单(点击查看详情)'

  // 组装订阅消息
  const message = {
    page: `/pages/order-detail/order-detail?orderCode=${orderCode}&in=share`,
    data: {
      // 订单编号
      character_string1: {
        value: orderCode
      },
      // 台号
      thing2: {
        value: room.name
      },
      // 菜品
      thing3: {
        value: menuName1
      },
      // 价格
      amount4: {
        value: totalPrice + '元'
      },
      thing5: {
        value: menuName2
      }
    },
    templateId: 'hYtLok-Zolqoz1Nd9iTM9q3cfV6jF-WhA3WyT5XMyiU'
  }

  // 循环admin
  const adminIds = wx._data.adminIds
  if (adminIds.length > 0) {
    for (const adminId of adminIds) {
      message.touser = adminId
      sendMessageWithCloudFunc(message)
    }
  } else {
    // 写死 ba
    message.touser = 'oqia25OBQaq1xnaGeLiTaThQkkSw'
    sendMessageWithCloudFunc(message)
  }
}

// 调用云函数发送消息
function sendMessageWithCloudFunc(message) {
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
}

// 更新房间状态 入参: 包间对象
function updateRoomStatus(room) {
  wx.cloud.callFunction({
    name: 'room-status',
    data: {
      status: 1,
      _id: room._id
    }
  }).then(res => {
    console.log('房间状态更改成功', 1)
  }).catch(err => {
    console.log(err)
  })
}

/* 二维码 */

// 生成二维码 入参: 包间对象
export function getRoomMiniCode(room) {

  wx._load.show('获取二维码')
  return wx.cloud.callFunction({
    name: 'minicode',
    data: {
      path: `pages/menu-list/menu-list?id=${room.id}&in=share`,
      roomNumber: room.name
    }
  }).then(res => {
    wx._load.hide()
    // 返回fileID
    return res.result.fileID
  }).catch(err => {
    console.log(err)
    wx._load.hide()
  })
}

// 保存二维码图片 入参: 图片的fileID, 包间对象
export function saveMiniCode(fileID, room) {
  // 下载图片 获取临时链接
  wx.cloud.downloadFile({
    fileID
  }).then(res => {
    const filePath = res.tempFilePath
    if (filePath) {
      // 图片的临时链接存在
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => {
          wx._toast.show(room.name + '的二维码保存成功')
          wx.cloud.deleteFile({
            fileList: [fileID]
          })
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  })
}