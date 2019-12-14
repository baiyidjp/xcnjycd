// miniprogram/pages/home/home.js

const menuListCollection = wx.cloud.database().collection('menu_list')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    dataList: [],
    currentIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    const scrollViewHeight = `${wx.jp.windowHeight - wx.jp.navigationBarHeight - 78}px`
    this.setData({scrollViewHeight})

    this.requestData()
  },

  requestData() {

    menuListCollection.orderBy('id','asc').get().then(res => {
      const dataList = res.data
      this.setData({dataList})
    })
  },

  categoryClick(event) {
    const currentIndex = event.detail
    this.setData({currentIndex})
  }
})