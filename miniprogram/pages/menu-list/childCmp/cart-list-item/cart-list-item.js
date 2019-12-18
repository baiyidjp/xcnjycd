// pages/home/childCmp/cart-list-item/cart-list-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    addClick() {
      const item = this.data.item
      this.triggerEvent('addclick', item)
    },

    subClick() {
      const item = this.data.item
      this.triggerEvent('subclick', item)
    }
  }
})
