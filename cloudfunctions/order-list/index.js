// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {

  // 只能拿到自己的数据
  if (event.openid) {
    return cloud.database().collection('order_list').orderBy('date', 'desc').where({
      _openid: event.openid
    }).get()
  }

  // 获取单个订单的信息
  if (event.orderCode) {
    return cloud.database().collection('order_list').where({
      orderCode: event.orderCode
    }).get()
  }

  // 获取全部订单
  return cloud.database().collection('order_list').orderBy('date', 'desc').get()
}