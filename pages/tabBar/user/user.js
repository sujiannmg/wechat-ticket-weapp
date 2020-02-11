// pages/tabBar/user/user.js
const app = getApp()
Page({

  onShareAppMessage(res) {
    return {
      title: '精仿猫眼电影',
      path: 'pages/tabBar/movie/movie'
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 页面加载时使用用户授权逻辑，弹出确认的框  
    this.userAuthorized()
  },

  userAuthorized() {
    const _this = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log("-----")
              console.log(res.userInfo)
              console.log("-----")
              _this.setData({
                hasUserInfo: true,
                userInfo: res.userInfo
              })
            }
          })
        } else {
          _this.setData({
            hasUserInfo: false
          })
        }
      }
    })
  },

  onGetUserInfo(event) {
    const userInfo = event.detail.userInfo
    if (userInfo) {
      // 1. 小程序通过wx.login()获取code
      wx.login({
        success: function(login_res) {
          //获取用户信息
          wx.getUserInfo({
            success: function(info_res) {
              // 2. 小程序通过wx.request()发送code到开发者服务器
              wx.request({
                url: 'http://localhost:8080/wechatuserinfo/wechatuserlogin',
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  code: login_res.code, //临时登录凭证
                  rawData: info_res.rawData, //用户非敏感信息
                  signature: info_res.signature, //签名
                  encrypteData: info_res.encryptedData, //用户敏感信息
                  iv: info_res.iv //解密算法的向量
                },
                success: function(res) {
                  if (res.data.status == 200) {
                    // 7.小程序存储skey（自定义登录状态）到本地
                    wx.setStorageSync('userInfo', userInfo);
                    wx.setStorageSync('skey', res.data.data);
                  } else{
                    console.log('服务器异常');
                  }
                },
                fail: function(error) {
                  //调用服务端登录接口失败
                  console.log(error);
                }
              })
            }
          })
        }
      })
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})