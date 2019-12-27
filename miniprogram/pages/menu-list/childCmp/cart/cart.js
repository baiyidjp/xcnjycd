// pages/home/childCmp/cart/cart.js

Component({
  /**
   * 组件的属性列表
   */
  properties: { 
    cartList: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) {
        // 属性值变化时执行
        this.getCartCount()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    cartCount: 0,
    cartIcon: '',
    bottom: '0px'
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const bottom = `${wx._device.screenHeight >= 812 ? 34 : 0}px`
      this.setData({ bottom })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 重新获取总个数
    getCartCount() {
      const cartCount = this.data.cartList.reduce((oldValue, newValue) => {
        return oldValue + newValue.count
      }, 0)
      
      const cartIcon = cartCount > 0 ? '/assets/common/cart_active.png' : '/assets/common/cart.png'

      this.setData({ 
        cartCount,
        cartIcon
      })

    },

    // 点击购物车
    cartClick() {
      if (this.data.cartCount > 0) {
        this.triggerEvent('cartclick')
      }
    }
  }
})
