// pages/home/childCmp/menu-item/menu-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    menuItem: {
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {
        // 监听数据 count
        if (newVal.count >= 0) {
          this.setData({
            chooseCount: newVal.count
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    foodIcon: '/assets/common/food_placeholder.png',
    chooseCount: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    addClick() {
      const item = this.data.menuItem
      this.triggerEvent('addclick', item)
    },

    subClick() {
      const item = this.data.menuItem
      this.triggerEvent('subclick', item)
    }
  }
})
