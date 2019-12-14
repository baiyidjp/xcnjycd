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
    cartIcon: ''
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

    }

  }
})
