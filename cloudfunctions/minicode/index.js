// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {

  // 获取小程序二维码
  const wxacodeResult = await cloud.openapi.wxacode.get({
    path: event.path || 'pages/home/home',
    width: event.width || 430
  })

  const fileExtensionMatches = wxacodeResult.contentType.match(/\/([^\/]+)/)
  const fileExtension = (fileExtensionMatches && fileExtensionMatches[1]) || 'jpg'

  // 上传到云存储
  return cloud.uploadFile({
    fileContent: wxacodeResult.buffer,
    // 云存储的路径
    cloudPath: `minicode/room${event.roomNumber}.${fileExtension}`
  })
}