//app.js
// 腾讯地图 微信小程序js SDK
const QQMapWX = require('./assets/libs/qqmap-wx-jssdk.js');
let qqmapsdk;

App({
  onLaunch: function () {
    this.initPage()
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'YZQBZ-UVJKG-SWGQI-IITOP-XB2SJ-FNBTT' // 腾讯位置服务key
    });
  },
  initPage(){
    // 获取用户授权信息信息,防止重复出现授权弹框
    wx.getSetting({
      success: res => {
        //已有权限直接获得信息，否则出现授权弹框
        if (res.authSetting['scope.userLocation']) {
          this.getUserLocation()
        } else {
          this.getUserLocation()
        }
      }
    })
  },
  //获取用户的位置信息
  getUserLocation() {
    wx.getLocation({
      //成功授权
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        // 使用腾讯地图接口将位置坐标转出成名称（为什么弹框出出现两次？）
        qqmapsdk.reverseGeocoder({
          location: {   //文档说location默认为当前位置可以省略，但是还是要手动加上，否则弹框会出现两次，手机端则出现问题
            latitude,
            longitude
          },
          success: (res) => {
            // cityFullname取自于请求成功后的json数组数据
            const cityFullname = res.result.address_component.city;
            const cityInfo = {
              latitude,
              longitude,
              // 提取除去最后一个字符的字符串（去除市）
              cityName: cityFullname.substring(0, cityFullname.length - 1),
              status:1
            }
            // ...表示cityInfo整个对象属性
            this.globalData.userLocation = { ...cityInfo}   //浅拷贝对象
            this.globalData.selectCity = { ...cityInfo } //浅拷贝对象
            console.log(this.globalData.selectCity);
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回，所以此处加入 callback 以防止这种情况
            if (this.userLocationReadyCallback) {
              this.userLocationReadyCallback()
            }
          }
        })
      },
      fail:()=>{
        this.globalData.userLocation = {status:0}
        //防止当弹框出现后，用户长时间不选择，
        if (this.userLocationReadyCallback) {
          this.userLocationReadyCallback()
        }
      }
    })
  },
  globalData: {
    userLocation: null, //用户的位置信息
    selectCity: null //用户切换的城市
  },
  onGetUserInfo(event) {
    const userInfo = event.detail.userInfo
    if (userInfo) {
        wx.login({
            success: function (login_res) {
                wx.getUserInfo({
                    success: function (res) {
                        wx.request({
                            url: config.api_base_url+'me/login',
                            method: 'POST',
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            data: {
                                code:login_res.code,
                                userHead: userInfo.avatarUrl,
                                userName: userInfo.nickName,
                                userGender: userInfo.gender,
                                userCity: userInfo.city,
                                userProvince: userInfo.province
                            },
                            success:function(res) {
                                const userInfo = res.data.object
                                // 将返回的数据保存到全局的缓冲中，方便其他页面使用
                                wx.setStorage({ key: 'userInfo', data: userInfo })
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
  }
})