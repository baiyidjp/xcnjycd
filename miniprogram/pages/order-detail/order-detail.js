// miniprogram/pages/order-detail/order-detail.js

const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: 0,
    order: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const scrollViewHeight = `${wx.jp.windowHeight - wx.jp.navigationBarHeight}px`
    this.setData({scrollViewHeight})

    wx.jp.loading()
    // const order = JSON.parse(options.order)
    const orderCode = options.orderCode
    wx.cloud.database().collection('order_list').where({
      orderCode
    }).get().then(res => {      
      const order = res.data[0]
      this.setData({order})
      wx.jp.hideLoading()
    }).catch(err => {
      wx.jp.hideLoading()
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})