// pages/home/childCmp/cart-list/cart-list.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cartList: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    viewHeight: 0
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const viewHeight = `${wx.jp.windowHeight - wx.jp.navigationBarHeight}px`
      console.log(viewHeight);
      this.setData({viewHeight})
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
