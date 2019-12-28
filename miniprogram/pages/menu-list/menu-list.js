// miniprogram/pages/menu-list/menu-list.js

const locationToast = '检测到您未在饭店,请在饭店内下单'
const menuFunc = require('../../managers/menuFunc.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    room: {},
    scrollViewHeight: '0px',
    dataList: [],
    currentIndex: 0,
    cartList: [],
    isShowCartList: false,
    isAdmin: false,
    totalPrice: 0, 
    orderAlertShow: false,
    miniCodeAlertShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    miniCodeFileID: '',
    miniCodeTempFilePath: '',
    isShareIn: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({ 
      // 滚动的高度
      scrollViewHeight: menuFunc.getScrollViewHeight(),
      // 是否是管理员
      isAdmin: wx._data.isAdmin,
      // 判断是否为分享进来的
      isShareIn: options.in == 'share'
    })
    
    // 获取当前房间的数据
    menuFunc.getHomeData(options.id).then(room => {
      if (room != 0) {
        // 0代表有客人,不是0可以点餐
        this.setData({room})
      }
    })

    // 获取菜单数据
    menuFunc.getMenuData().then(dataList => {
      this.setData({dataList})
    })
  },

  // 点击菜单的分类 记录当前点击的index
  categoryClick(event) {
    const currentIndex = event.detail
    this.setData({ currentIndex })
  },

  // 添加商品到购物车
  addFoodToCartList(event) {
    const result = menuFunc.addFood(event.detail, this.data.dataList, this.data.cartList, this.data.currentIndex)
    this.setData({ 
      cartList : result.cartList,
      dataList: result.dataList
    })
  },

  // 移除选中的数量
  removeFoodFromCartList(event) {
    const result = menuFunc.removeFood(event.detail, this.data.dataList, this.data.cartList, this.data.currentIndex)
    this.setData({
      cartList: result.cartList,
      dataList: result.dataList
    })
    // 如果购物车被清空 则隐藏购物车列表
    if (result.cartList.length <= 0) {
      this.setData({
        isShowCartList: false
      })
    }
  },

  // 点击购物车图标
  cartClick() {
    const isShowCartList = !this.data.isShowCartList
    this.setData({ isShowCartList })
  },

  // 下单
  orderClick(event) {
    wx._load.show()
    // 判断是否在饭店周围
    menuFunc.isNearby().then(res => {
      wx._load.hide()
      if (res) {
        // 记录总价 展示弹窗
        this.setData({
          orderAlertShow: true,
          totalPrice: event.detail
        })
      } else {
        wx._toast.showDelay(locationToast)
      }
    }).catch(err => {
      console.log(err)
      wx._load.hide()
    })
  },

  // 订单确认弹窗点击
  tapOrderButton(e) {

    // 设置弹窗消失
    this.setData({
      orderAlertShow: false
    })

    // 判断是否点击了确定
    if (e.detail.index == '1') {
      // 上传订单
      menuFunc.uploadOrder(this.data.totalPrice, this.data.cartList, this.data.room).then(res => {
        wx._toast.show('订单提交成功')
        // 提交成功 清空购物车
        this.removeCartList()
      }).catch(err => {
        console.log(err)
        wx._toast.show('订单提交失败')
      })
    }
  },

  // 清空购物车
  removeCartList() {
    
    const dataList = this.data.dataList.map(data => {
      data.items.map(item => {
        item.count = 0
        return item
      })
      return data
    })

    this.setData({
      isShowCartList: false,
      cartList: [],
      dataList
    })
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      path: `pages/menu-list/menu-list?id=${this.data.room.id}&in=share`,
    }
  },

  // 生成二维码
  miniCode() {
    // 获取二维码图片的fileID
    menuFunc.getRoomMiniCode(this.data.room).then(res => {
      const fileID = res
      this.setData({
        miniCodeFileID: fileID,
        miniCodeAlertShow: true
      })
    })
  },

  // 下载图片的确认
  tapMiniCodeButton(event) {
    // 设置弹窗消失
    this.setData({
      miniCodeAlertShow: false
    })
    // 判断是否点击了确定
    if (event.detail.index == '1') {
      menuFunc.saveMiniCode(this.data.miniCodeFileID, this.data.room)
    } else {
      wx.cloud.deleteFile({
        fileList: [this.data.miniCodeFileID]
      })
    }
  },

  // 导航的Home点击 分享进来才会展示
  homeClick() {
    console.log('homeClick');
    wx.switchTab({
      url: '/pages/home/home'
    })
  }

})