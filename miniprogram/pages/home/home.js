// miniprogram/pages/home/home.js

const menuListCollection = wx.cloud.database().collection('menu_list')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    dataList: [],
    currentIndex: 0,
    cartList: []
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
      if (findItem) {
        // 存在商品 数量+1
        findItem.count += 1
      } else {
        // 不存在 加入购物车
        data.count = 1
        cartList.push(data)
      }
      this.setData({ cartList })
    }
  }
})