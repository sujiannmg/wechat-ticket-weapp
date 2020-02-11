import * as echarts from '../../../components/ec-canvas/echarts';
const util = require('../../../utils/util.js')

let barec = null

Page({

  onShareAppMessage: function (res) {
    return {
      title: 'ECharts',
      path: 'pages/subPages/box-office-detail/box-office-detail',
      success: function () { },
      fail: function () { }
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    detailMovie: null,    //电影详情
    ec: {
      onInit: function (canvas, width, height) {
        barec = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        canvas.setChart(barec);
        return barec;
      }
    },
    sumBoxInfo: '', // 累计综合票房/亿
    boxInfo: '', // 综合票房/万
    showInfo: '', // 排片场次/次
    splitSumBoxInfo: '', // 累计分账票房/亿
    splitBoxInfo: '', // 分账票房/万
    avgSeatView: '', // 上座率/百分比
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options){
    const movieId = options.movieId
    this.initPage(movieId)
  },

  //初始页面
  initPage(movieId){
    const _this = this
    wx.showLoading({
      title: '加载中...',
    })
    // 电影详情
    wx.request({
      url: `https://m.maoyan.com/ajax/detailmovie?movieId=${movieId}`,
      success(res) {
        wx.hideLoading()
        _this.setData({
          detailMovie: _this.handleData(res.data.detailMovie),
        })
      }
    })
    // https://piaofang.maoyan.com/movie/248906/boxshow
    // https://piaofang.maoyan.com/movie/248906?_v_=ye
    // https://piaofang.maoyan.com/movie/${movieId}/boxshow
    // 
    wx.request({
      url: 'https://box.maoyan.com/promovie/api/box/second.json',
      success(res) {
        wx.hideLoading()
        for(var i = 0; i <= res.data.data.list.length; i++) {
          var _movieId = res.data.data.list[i].movieId
          if(movieId == _movieId) {
            _this.setData({
              sumBoxInfo: (res.data.data.list[i].sumBoxInfo).replace("亿", ""), // 累计综合票房/亿
              boxInfo: res.data.data.list[i].boxInfo, // 综合票房/万
              showInfo: res.data.data.list[i].showInfo, // 排片场次/次
              splitSumBoxInfo: (res.data.data.list[i].splitSumBoxInfo).replace("亿", ""), // 累计分账票房/亿
              splitBoxInfo: res.data.data.list[i].splitBoxInfo, // 分账票房/万
              avgSeatView: res.data.data.list[i].avgSeatView, // 上座率/百分比
            })
            break
          }
        }
        
      }
    })
  },

  //处理评分星星
  formatStar(sc){
    //1分对应满星，0.5对应半星
    let stars = new Array(5).fill('star-empty')
    const fullStars = Math.floor(sc)  //满星的个数
    const halfStar = sc % 1 ? 'star-half' : 'star-empty' //半星的个数，半星最多1个
    stars.fill('star-full', 0, fullStars)              //填充满星
    if (fullStars < 5) {
      stars[fullStars] = halfStar;           //填充半星
    }
    return stars
  },

  //处理数据
  handleData(data){
    //小程序的{{}}中不能调用函数，只能在这里处理数据
    let obj = data
    obj.img = obj.img.replace('w.h','177.249')
    //将类似“v3d imax”转化为['3D','IMAX']
    obj.version = obj.version && obj.version.split(' ').map(item=>{
      return item.toUpperCase().replace('V','')
    })
    //将评分人数单位由个转化为万
    obj.snum = obj.snum/10000
    obj.snum = obj.snum.toFixed(1)
    //评分星星,满分10分，一颗满星代表2分
    obj.stars = this.formatStar(obj.sc/2)
    //处理媒体库的图片
    obj.photos = obj.photos.map(item => item.replace('w.h/', '') +'@180w_140h_1e_1c.webp')
    return obj
  },

  // 获取想看数据
  getData(){
    const _this = this
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: `https://piaofang.maoyan.com/movie/${_this.options.movieId}/wantchart`,
      success:function(res){
        let _yValue = [] // 定义图例y轴值
        let _xValue = [] // 定义图例x轴值
        let _desc = ""   // 定义图例描述
        // 遍历图例y轴值
        // for(var i = 0; i < res.data.data[0].points.length; i++) {
        //   var yValue = []
        //   var xValue = []
        //   yValue = res.data.data[0].points[i].yValue
        //   xValue = res.data.data[0].points[i].xValue
        //   _yValue.push(yValue)
        //   /*
        //    xValue.replace(/(\d{4})(\d{2})(\d{2})/g,'$1/$2/$3') 
        //    正则表达式如（20140903）转换成日期格式（2014/09/03）
        //    substr(5)截取字符串，只取月日
        //   */
        //   _xValue.push((xValue.replace(/(\d{4})(\d{2})(\d{2})/g,'$1/$2/$3')).substr(5))
        // }
        
        for(var i = 0; i < res.data.data[1].points.length; i++) {
          var yValue = []
          var xValue = []
          // var desc = ""
          yValue = res.data.data[1].points[i].yValue
          xValue = res.data.data[1].points[i].xValue
          // desc = res.data.data[1].points[i].desc
          _yValue.push(yValue)
          /*
           xValue.replace(/(\d{4})(\d{2})(\d{2})/g,'$1/$2/$3') 
           正则表达式如（20140903）转换成日期格式（2014/09/03）
           substr(5)截取字符串，只取月日
          */
          _xValue.push((xValue.replace(/(\d{4})(\d{2})(\d{2})/g,'$1/$2/$3')).substr(5))
         // _desc.push(desc)
        }
        // var data = this.traversalWantChart(res.data);
        barec.setOption({
          color: ['#FFA91B'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
              type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            data: ['想看日增人数']
          },
          grid: {
            left: 10,
            right: 20,
            bottom: 15,
            top: 25,
            containLabel: true
          },
          xAxis: [
            {
              type: 'value',
              axisLine: {
                lineStyle: {
                  color: '#999'
                }
              },
              axisLabel: {
                color: '#666'
              }
            }
          ],
          yAxis: [
            {
              type: 'category',
              axisTick: { show: false },
              data: _xValue,
              axisLine: {
                lineStyle: {
                  color: '#999'
                }
              },
              axisLabel: {
                color: '#666'
              }
            }
          ],
          series: [
            {
              name: '想看日增人数',
              type: 'bar',
              label: {
                normal: {
                  show: true,
                  position: 'inside'
                }
              },
              data: _yValue,
              itemStyle: {
                // emphasis: {
                //   color: '#37a2da'
                // }
              }
            }
          ]
        })
        wx.hideLoading(); 
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  /*
  // 获取时间差
  getDateTime(start, end) {
    var startTime = this.getDate(start);
    var endTime = this.getDate(end);
    var dateArr = [];
    console.log(endTime.getTime() - startTime.getTime())
    while ((endTime.getTime() - startTime.getTime()) > 0) {
      // var year = startTime.getFullYear();
      var month = startTime.getMonth().toString().length === 1 ? "0" + (parseInt(startTime.getMonth().toString(),10)) : (startTime.getMonth())
      var day = startTime.getDate().toString().length === 1 ? "0" + startTime.getDate() : startTime.getDate()
      dateArr.push(month + "/" + day)
      startTime.setDate(startTime.getDate() + 1)
    }
    return dateArr;
  },

  // 格式化时间
  getDate (datestr) {
    // 正则表达式如（20140903）转换成日期格式（2014-09-03）
    const _datestr = datestr.replace(/(\d{4})(\d{2})(\d{2})/g,'$1-$2-$3');
    const temp = _datestr.split("-");
    const date = new Date(temp[0],temp[1],temp[2]);
    return date
  },
  */

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    setTimeout(this.getData, 500)
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