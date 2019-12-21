// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {

  const status = event.status
  return cloud.database().collection('order_list').doc(event._id).update({
    data: {
      status
    }
  })
}