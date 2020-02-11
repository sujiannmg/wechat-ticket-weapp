Page({
  data: {
    order: null,
    first: true //是否是第一次支付
  },
  onLoad(params) {
    const paramsObj = JSON.parse(params.paramsStr)
    this.initData(paramsObj)
  },
  initData(params) {
    this.setData({
      order: params
    })
  },
  //模拟支付
  payment() {
    //避免重复支付
    if (this.data.first) {
      let movieOrder = wx.getStorageSync('movieOrder') || []
      movieOrder.unshift(this.data.order)
      // wx.setStorageSync(string key, any data)本地缓存数据
      console.log("影院名称：" + movieOrder[0].cinemaName)
      console.log("影院位置：" + movieOrder[0].cinemaData.addr)
      console.log("影片名称：" + movieOrder[0].movieName)
      console.log("影片开始时间：" + movieOrder[0].time)
      console.log("影片标签：" + movieOrder[0].lang)
      console.log("观影具体位置：" + movieOrder[0].hall + "-" + movieOrder[0].seat)

      console.log("影片订单号：" + movieOrder[0].orderId)
      console.log("用户手机号：" + movieOrder[0].cinemaData.shopId)
      console.log("影片流水号：" + movieOrder[0].flowNumber)
      console.log("订单验证码：" + movieOrder[0].Vcode)
      console.log("订单总价：" + movieOrder[0].price)
      // 拼接一个orders json对象
      let orders = {
        cinemaName: movieOrder[0].cinemaName, // 影院名称
        cinemaAddress: movieOrder[0].cinemaData.addr, // 影院位置
        movieName: movieOrder[0].movieName, // 影片名称
        movieTime: movieOrder[0].time, // 影片开始时间
        movieLabel: movieOrder[0].lang, // 影片标签
        cinemaSpecificAddress: movieOrder[0].hall + "-" + movieOrder[0].seat, // 观影具体位置
        movieOrderNum: movieOrder[0].orderId, // 影片订单号
        userPhoneNum: movieOrder[0].cinemaData.shopId, // 用户手机号
        movieSerialNum: movieOrder[0].flowNumber, // 影片流水号
        orderVerificationNum: movieOrder[0].Vcode, // 订单验证码
        orderSumPrice: movieOrder[0].price, // 订单总价
      }
      // 将json对象转为一个order字符串
      let order =  JSON.stringify(orders)
      console.log(order)
      wx.request({
        url: 'http://localhost:8080/ticket/order',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
         order: order
        },
        success: function (res) {
          if (res.data.status == 200) {
            wx.setStorageSync('movieOrder', movieOrder)
            wx.showToast({
              title: '支付成功',
            })
            // 跳转到我的页面（在app.json中注册过的tabBar页面），同时关闭其他非tabBar页面。
            wx.switchTab({
              url: `../../tabBar/user/user`
            })
            this.setData({
              first: false
            })
          } else {
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
            console.log('服务器异常');
          }
        },
        fail: function (error) {
          wx.showToast({
            title: '支付失败',
          })
          //调用服务端登录接口失败
          console.log(error);
        }
      })
    } else {
      wx.showToast({
        title: '已支付',
        icon: 'none'
      })
    }
  }
})