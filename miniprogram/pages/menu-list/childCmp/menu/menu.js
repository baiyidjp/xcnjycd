// pages/home/childCmp/menu/menu.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    menuData: {
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
    addClick(event) {
      this.triggerEvent('addclick', event.detail)
    },
    subClick(event) {
      this.triggerEvent('subclick', event.detail)
    }
  }
})
