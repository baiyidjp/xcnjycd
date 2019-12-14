// pages/home/childCmp/category/category.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    categoryList:{
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

    categoryClick(event) {
      const currentIndex = event.currentTarget.dataset.index
      this.setData({currentIndex})
      this.triggerEvent('categoryclick', currentIndex)
    }
  }
})
