// miniprogram/pages/order-detail/order-detail.js

const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    order: {},
    orderDate: '',
    isShowButtons: false,
    adminIds: wx.jp.adminIds
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const bottom = wx.jp.screenHeight >= 812 ? 34 : 0
    const scrollViewHeight = `${wx.jp.screenHeight - wx.jp.navigationBarHeight - bottom}px`
    this.setData({ scrollViewHeight })

    this.requestData(options.orderCode)
  },

  requestData(orderCode) {
    wx.jp.loading()
    const cloudFuncObj = {
      name: 'order-list',
      data: {
        orderCode
      }
    }
    wx.cloud.callFunction(cloudFuncObj).then(res => {
      console.log(res)
      const order = res.result.data[0]
      const orderDate = util.formatDate(new Date(order.date), 'yyyy-MM-dd hh:mm:ss')
      order.orderDate = orderDate
      // 订单的状态 0-上菜中 1-已取消 2-已完成
      const statusString = order.status == 0 ? '上菜中' : (order.status == 1 ? '已取消' : '已完成')
      order.statusString = statusString
      const isShowButtons = (order.status == 0 && this.data.adminIds.find((id => id == wx.jp.ids.openid)))
      this.setData({
        order,
        isShowButtons
      })
      wx.jp.hideLoading()
    }).catch(err => {
      wx.jp.hideLoading()
      console.log(err)
    })
  },

  // 点击取消按钮
  buttonClick(event) {
    wx.jp.loading()
    // 更改订单的状态 1-已取消 2-已完成
    const status = parseInt(event.currentTarget.dataset.index)
    console.log(status,this.data.order._id)
    wx.cloud.callFunction({
      name: 'order-status',
      data: {
        status,
        _id: this.data.order._id
      }
    }).then(res => {
      wx.jp.hideLoading()
      wx.jp.toast('订单状态更改成功')
      // 重新刷新数据
      this.requestData(this.data.order.orderCode)
      // 更改房间状态为 0 无人
      wx.cloud.callFunction({
        name: 'room-status',
        data: {
          status: 0,
          _id: this.data.order.room._id
        },
        complete: res => {
          console.log('room-status result: ', res)
        }
      })
    }).catch(err => {
      console.log(err)
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