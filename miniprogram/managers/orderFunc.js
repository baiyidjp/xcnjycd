
const util = require('../utils/util.js')

// 获取scrollView的高度
export function getScrollViewHeight() {
  const scrollViewHeight = `${wx._device.screenHeight - wx._device.navigationBarHeight - wx._device.bottom}px`
  return scrollViewHeight
}

// 获取订单列表
export function getOrderList() {
  wx._load.show()

  const cloudFuncObj = {
    name: 'order-list'
  }
  if (!wx._data.isAdmin) {
    // 普通用户
    cloudFuncObj.data = {
      openid: wx._data.openid
    }
  }

  return wx.cloud.callFunction(cloudFuncObj).then(res => {
    wx._load.hide()
    const orderList = res.result.data.filter(order => order.menuList.length)
    orderList.map(order => {
      if (order.menuList.length >= 2) {
        order.menus = order.menuList.slice(0, 2)
      } else {
        order.menus = order.menuList
      }
      // 订单的状态 0-上菜中 1-已取消 2-已完成
      const statusString = order.status == 0 ? '上菜中' : (order.status == 1 ? '已取消' : '已完成')
      order.statusString = statusString
      return order
    })
    return orderList
  }).catch(err => {
    wx._load.hide()
    console.log(err)
  })
}

export function getOrderDetail(orderCode) {
  wx._load.show()
  const cloudFuncObj = {
    name: 'order-list',
    data: {
      orderCode
    }
  }
  return wx.cloud.callFunction(cloudFuncObj).then(res => {
    console.log(res)
    const orderData = res.result.data
    if (orderData.length <= 0) {
      wx._toast.show('数据错误')
      return
    }
    const order = orderData[0]
    const orderDate = util.formatDate(new Date(order.date), 'yyyy-MM-dd hh:mm:ss')
    order.orderDate = orderDate
    // 订单的状态 0-上菜中 1-已取消 2-已完成
    const statusString = order.status == 0 ? '上菜中' : (order.status == 1 ? '已取消' : '已完成')
    order.statusString = statusString
    wx._load.hide()
    return order
  }).catch(err => {
    wx._load.hide()
    console.log(err)
  })
}

export function optionButtonClick(status, order) {
  wx._load.show()
  // 更改订单的状态 1-已取消 2-已完成
  return wx.cloud.callFunction({
    name: 'order-status',
    data: {
      status,
      _id: order._id
    }
  }).then(res => {
    wx._load.hide()
    wx._toast.show('订单状态更改成功')
    // 更改房间状态为 0 无人
    wx.cloud.callFunction({
      name: 'room-status',
      data: {
        status: 0,
        _id: order.room._id
      },
      complete: res => {
        console.log('room-status result: ', res)
      }
    })
  }).catch(err => {
    console.log(err)
    wx._load.hide()
  })
}