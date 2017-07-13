// pages/yejipm/yejipm.js
var Echarts = require('../../utils/wxcharts.js');
var util = require('../../utils/util.js');
var app = getApp()
Page({
  data: {
    startdate: '',
    enddate: util.formatTime(new Date(), 'date'),
    pickshow: true,
    iconshow: false,
    confirmshow: true,
    selectRanking: '0',
    swiperCurrent: 0
  },
  //起始时间
  bindDateStart: function (e) {
    this.setData({
      startdate: (e.detail.value).replace(/-/g, '/'),
      enddate: util.dateDiffDay((e.detail.value), 4, 'after')
    })
  },
  //结束时间
  bindDateEnd: function (e) {
    this.setData({
        enddate: (e.detail.value).replace(/-/g, '/'),
        startdate: util.dateDiffDay((e.detail.value), 4, 'before')
    })
  },
  radioChange: function(e) {
      this.setData({
          selectRanking: e.detail.value
      })
  },
  bindShow: function () {
    console.log(111);
    this.setData({
      pickshow: false,
      iconshow: true,
      confirmshow: false
    })
  },
  bindHide: function () {
    this.setData({
      pickshow: true,
      iconshow: false,
      confirmshow: true
    });
    console.log(this.data.startdate);
    this.requestData();
  },
  //前查
  bindBefore: function () {
    var curStart = this.data.startdate,
      curEnd = this.data.enddate;
    this.setData({
      startdate: util.dateDiffDay(curStart, 5, 'before'),
      enddate: util.dateDiffDay(curEnd, 5, 'before')
    });
    this.requestData();
  },
  //后查
  bindAfter: function () {
    var curStart = this.data.startdate,
      curEnd = this.data.enddate;
    this.setData({
      startdate: util.dateDiffDay(curStart, 5, 'after'),
      enddate: util.dateDiffDay(curEnd, 5, 'after'),
    });
    this.requestData();
  },
  // swiperChange: function (e) {
  //   this.setData({
  //     swiperCurrent: e.detail.current
  //   })
  // },
  // clickCurrent: function (e) {
  //   var _index = e.target.dataset.index;
  //   this.setData({
  //     swiperCurrent: _index
  //   })
  // },
  requestData: function () {
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.windowWidth);
        self.setData({
          windowWidth: res.windowWidth
        })
      }
    });

    util.requestData('performance.ranking',
      { startTime: this.data.startdate, endTime: this.data.enddate, dayMonth: '0', selectRanking: this.data.selectRanking },
      wx.getStorageSync('sessionid'),
      function (res) {
        console.log(res);
        var nameList = [], dataList = [], totalval=0;
        res.forEach(function (item) {
          nameList.push(item.name);
          dataList.push(item.value);
          totalval += Number(item.value);
        });
        self.setData({
          listData: res,
          totalValue: totalval        
        });
        new Echarts({
          canvasId: 'echarts-canvas',
          type: 'column',
          categories: nameList,
          series: [{
            name: '业绩排名',
            data: dataList,
            color: '#f08080'
          }],
          yAxis: {
            min: 0          
          },
          width: self.data.windowWidth,
          height: 300
        });
      })
  },
  onLoad: function () {
    var self = this;
    this.setData({
      startdate: util.dateDiffDay(self.data.enddate, 4, 'before')
    });
    console.log(typeof this.data.enddate);
    this.requestData();
  },
  onReady: function () {
    // 页面渲染完成



  }

});