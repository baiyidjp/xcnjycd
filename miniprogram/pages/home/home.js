// miniprogram/pages/home/home.js

const menuListCollection = wx.cloud.database().collection('menu_list')
const flagListCollection = wx.cloud.database().collection('flag_list')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight: '0px',
    dataList: [],
    currentIndex: 0,
    cartList: [],
    isShowCartList: false
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

    // 先查看是否有缓存
    const dataCache = wx.getStorageSync('menu-list')
    if (dataCache) {
      this.setData({
        dataList: dataCache
      })
      // 是否需要刷新缓存数据
      flagListCollection.get().then(res => {
        if (res.data.length > 0) {
          const flag_list = res.data[0]
          if (flag_list.isRequestMenuList) {
            this.getLatestData()
          }
        }
      })
    } else {
      this.getLatestData()
    }
  },

  // 获取最新的数据
  getLatestData() {
    menuListCollection.orderBy('id', 'asc').get().then(res => {
      const dataList = res.data
      this.setData({ dataList })
      // 保存数据到本地
      wx.setStorage({
        key: 'menu-list',
        data: dataList,
      })
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

      // 取出列表的对应数据
      const dataList = this.data.dataList
      const menuList = dataList[this.data.currentIndex]
      const findMenuItem = menuList.items.find(item => {
        return item.id == data.id
      })

      if (findItem) {
        // 存在商品 数量+1
        findItem.count += 1
        findMenuItem.count += 1
      } else {
        // 不存在 加入购物车
        data.count = 1
        findMenuItem.count = 1
        cartList.push(data)
      }
      this.setData({ cartList })

      dataList[this.data.currentIndex] = menuList
      this.setData({dataList})
    }
  },

  // 移除选中的数量
  removeFoodFromCartList(event) {
    const data = event.detail
    // 是否传过来商品
    if (data) {
      // 是否已经存在购物车中
      const cartList = this.data.cartList
      const findItem = cartList.find(item => {
        return data.id == item.id
      })

      if (findItem) {
        // 存在商品 数量-1
        findItem.count -= 1

        // 取出列表的对应数据
        const dataList = this.data.dataList
        const menuList = dataList[this.data.currentIndex]
        const findMenuItem = menuList.items.find(item => {
          return item.id == findItem.id
        })
        // 列表数据 -1
        findMenuItem.count -= 1
        dataList[this.data.currentIndex] = menuList
        this.setData({ dataList })

      }
      if (findItem.count <= 0) {
        cartList.splice(cartList.indexOf(findItem), 1)
      }
      this.setData({ cartList })
    }
  },

  // 点击购物车图标
  cartClick() {
    const isShowCartList = !this.data.isShowCartList
    console.log(isShowCartList)
    this.setData({isShowCartList})
  }
})