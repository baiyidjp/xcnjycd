// pages/order-list/order-list.js

const orderFunc = require('../../managers/orderFunc.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    orderList: []
  },

  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    // 请求数据
    orderFunc.getOrderList().then(res => {
      this.setData({ 
        orderList: res 
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({ 
      scrollViewHeight: orderFunc.getScrollViewHeight() 
    })
  },

  orderClick(event) {
    const currentIndex = event.currentTarget.dataset.index
    console.log(currentIndex)
    const order = this.data.orderList[currentIndex]
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?orderCode=${order.orderCode}`
    });
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})