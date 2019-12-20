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

    const scrollViewHeight = `${wx.jp.windowHeight - wx.jp.navigationBarHeight}px`
    this.setData({scrollViewHeight})
  },

  requestData() {

    wx.jp.loading()

    const openid = wx.jp.ids.openid
    const adminIds = wx.jp.adminIds

    if (adminIds.find(id => id == openid)) {
      // 是admin
      wx.cloud.database().collection('order_list').get().then(res => {
        const orderList = res.data
        this.handleOrderList(orderList)
        wx.jp.hideLoading()
      }).catch(err => {
        wx.jp.hideLoading()
      })
    } else {
      // 只能拿到自己的数据
      wx.cloud.database().collection('order_list').where({
        _openid: openid
      }).get().then(res => {
        const orderList = res.data
        this.handleOrderList(orderList)
        wx.jp.hideLoading()
      }).catch(err => {
        wx.jp.hideLoading()
      })
    }
  },

  handleOrderList(orderList) {
    orderList.map(order => {
      if (order.menuList.length >= 2) {
        order.menus = order.menuList.slice(0,2)
      } else {
        order.menus = order.menuList
      }
      return order
    })
    this.setData({ orderList })
  },

  orderClick(event) {
    const currentIndex = event.currentTarget.dataset.index
    // 将对象转成字符串传递给下一个页面，在下个页面在转成JSON
    // const data = JSON.stringify(this.data.orderList[currentIndex])
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