// pages/order-list/order-list.js
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
    this.requestData()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const bottom = wx._device.screenHeight >= 812 ? 34 : 0
    const scrollViewHeight = `${wx._device.screenHeight - wx._device.navigationBarHeight - bottom}px`
    this.setData({ scrollViewHeight })
  },

  requestData() {

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

    wx.cloud.callFunction(cloudFuncObj).then(res => {
      const orderList = res.result.data.filter(order => order.menuList.length)
      this.handleOrderList(orderList)
      wx._load.hide()
    }).catch(err => {
      wx._load.hide()
      console.log(err)
    })
  },

  handleOrderList(orderList) {
    orderList.map(order => {
      if (order.menuList.length >= 2) {
        order.menus = order.menuList.slice(0,2)
      } else {
        order.menus = order.menuList
      }
      // 订单的状态 0-上菜中 1-已取消 2-已完成
      const statusString = order.status == 0 ? '上菜中' : (order.status == 1 ? '已取消' : '已完成')
      order.statusString = statusString
      return order
    })
    this.setData({ orderList })
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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