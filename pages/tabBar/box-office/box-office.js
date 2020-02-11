const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowDay: util.getTime(),
    queryDate: '',
    totalBoxInfo: '',
    totalBoxUnitInfo: '',
    updateInfo: '',
    boxList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage()
    
  },

  //初始化页面
  initPage() {
    wx.showLoading({
      title: '正在加载...'
    })
    const _this = this;
    wx.request({
      url: 'https://box.maoyan.com/promovie/api/box/second.json',
      success(res) {
        wx.hideLoading()
        _this.setData({
          queryDate: res.data.data.queryDate,
          totalBoxInfo: res.data.data.totalBoxInfo,
          totalBoxUnitInfo: res.data.data.totalBoxUnitInfo,
          updateInfo:  res.data.data.updateInfo,
          boxList: res.data.data.list
        })
      }
    })
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
    const _this = this;
    setInterval(function () {
      wx.request({
        url: 'https://box.maoyan.com/promovie/api/box/second.json',
        success(res) {
          wx.hideLoading()
          _this.setData({
            queryDate: res.data.data.queryDate,
            totalBoxInfo: res.data.data.totalBoxInfo,
            totalBoxUnitInfo: res.data.data.totalBoxUnitInfo,
            updateInfo:  res.data.data.updateInfo,
            boxList: res.data.data.list
          })
        }
      })
    }, 4000)
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