// miniprogram/pages/order-detail/order-detail.js

const orderFunc = require('../../managers/orderFunc.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    order: {},
    orderDate: '',
    isShowButtons: false,
    isShareIn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      scrollViewHeight: orderFunc.getScrollViewHeight()
    })

    // 判断是否为分享进来的
    if (options.in == 'share') {
      this.setData({
        isShareIn: true
      })
    }

    // 获取order detail
    this.requestOrderDetail(options.orderCode)
  },

  // 获取订单详情
  requestOrderDetail(orderCode) {
    orderFunc.getOrderDetail(orderCode).then(res => {
      const order = res
      const isShowButtons = (order.status == 0 && wx._data.isAdmin)
      this.setData({
        order,
        isShowButtons
      })
    })
  },

  // 点击取消按钮
  buttonClick(event) {
    // 更改订单的状态 1-已取消 2-已完成
    const status = parseInt(event.currentTarget.dataset.index)
    orderFunc.optionButtonClick(status, this.data.order).then(res => {
      // 重新刷新数据
      this.requestOrderDetail(this.data.order.orderCode)
    })
  },

  homeClick() {
    console.log('homeClick');
    wx.switchTab({
      url: '/pages/home/home'
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      path: `/pages/order-detail/order-detail?orderCode=${this.data.order.orderCode}&in=share`,
    }
  }
})