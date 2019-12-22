// 云函数入口文件
const cloud = require('wx-server-sdk')
//引入request-promise用于做网络请求
// var rp = require('request-promise');

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {

  new Promise((resolve, reject) => {
    request({
      url: event.url,
      method: 'GET',
      dataType: 'json',
      success: function (res) { 
        console.log(res)
        resolve(res)
      },
      fail: function (res) {
        reject(res)
      }
    })
  })
}