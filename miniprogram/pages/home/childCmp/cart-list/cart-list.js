// pages/home/childCmp/cart-list/cart-list.js
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
        this.getTotalPrice()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    viewHeight: 0,
    totalPrice: 0
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const viewHeight = `${wx.jp.windowHeight - wx.jp.navigationBarHeight}px`
      this.setData({viewHeight})
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    getTotalPrice() {
      const totalPrice = this.data.cartList.reduce((oldValue, newValue) => {
        return oldValue + newValue.count * newValue.price
      }, 0)

      this.setData({
        totalPrice
      })
    },

    backClick() {
      this.triggerEvent('backclick')
    },

    addClick(event) {
      this.triggerEvent('addclick', event.detail)
    },
    subClick(event) {
      this.triggerEvent('subclick', event.detail)
    },

    submitClick() {
      wx.requestSubscribeMessage({
        tmplIds: ['hYtLok-Zolqoz1Nd9iTM9jB7Ksrik1hLrmUYeZeAEEY'],
        success(res) {
          console.log('订阅成功')
        }
      })

      let menuName = this.data.cartList.reduce((oldValue, newValue) => {
        return oldValue + newValue.title + '*' + newValue.count + ', '
      }, '')
      menuName = menuName.substring(0, menuName.length - 2)
      if (menuName.length > 20) {
        // 字符串最多20字
        menuName = menuName.substring(0, 19)
      }
      const message = {
        touser: 'oqia25M2AS3evEc0GfI3OoHxeQtM',
        page: '/pages/home/home',
        data: {
          // 台号
          thing2: {
            value: '前台'
          },
          // 菜品
          thing3: {
            value: menuName
          },
          // 价格
          amount4: {
            value: this.data.totalPrice
          }
        },
        templateId: 'hYtLok-Zolqoz1Nd9iTM9jB7Ksrik1hLrmUYeZeAEEY'
      }
      console.log(message)
      wx.cloud.callFunction({
        name: 'send-message',
        data: {
          message
        }
      }).then(res => {
        console.log(res)
        // 提交成功 清空购物车
        wx.jp.toast('订单提交成功')
        this.triggerEvent('submitclick')
      }).catch(err => {
        console.log(err)
        wx.jp.toast('订单提交失败')
      })
    }
  }
})
