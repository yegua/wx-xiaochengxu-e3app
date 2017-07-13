// pages/zhongyuan-BBC-order/zhongyuan-BBC-order.js
var util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    warehouse: ['全部仓库', '一号仓', '富力仓', '黄埔仓'],
    platforms: [
      { platformName: '平台选择...', platformCode: '' },
      { platformName: '京东', platformCode: '8028' },
      { platformName: '苏宁', platformCode: '8014' },
      { platformName: '线下', platformCode: '301' },
      { platformName: '唯品会', platformCode: '8001' },
      { platformName: '通源立', platformCode: '8048' },
      { platformName: '其他', platformCode: '8038' }],
    currentIndex: '全部仓库',
    pickshow: true,
    iconshow: false,
    confirmshow: true,
    startdate: util.formatTime(new Date(), 'date') + ' 00:00:00',
    enddate: util.formatTime(new Date(), 'date') + ' 23:59:59',
    index: 0,
    currentType: 0,
    showtoast: true
  },
  clickSelect: function (e) {
    this.setData({
      currentIndex: e.target.dataset.index
    });
    this.requestData(e.target.dataset.index);
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  //起始时间
  bindDateStart: function (e) {
    this.setData({
      startdate: (e.detail.value).replace(/-/g, '/') + ' 00:00:00'
    })
  },
  //结束时间
  bindDateEnd: function (e) {
    this.setData({
      enddate: (e.detail.value).replace(/-/g, '/') + ' 23:59:59'
    })
  },
  //前查
  bindBefore: function () {
    var curStart = this.data.startdate,
      curEnd = this.data.enddate;
    this.setData({
      startdate: util.dateDiffDay(curStart, 1, 'before') + ' 00:00:00',
      enddate: util.dateDiffDay(curStart, 1, 'before') + ' 23:59:59'
    });
    this.requestData(this.data.currentIndex);
  },
  //后查
  bindAfter: function () {
    var curStart = this.data.startdate,
      curEnd = this.data.enddate;
    this.setData({
      startdate: util.dateDiffDay(curEnd, 1, 'after') + ' 00:00:00',
      enddate: util.dateDiffDay(curEnd, 1, 'after') + ' 23:59:59'
    });
    this.requestData(this.data.currentIndex);
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
    this.requestData(this.data.currentIndex);
  },
  requestData: function (flag) {
    var self = this;
    if (!util.compareWithDate(self.data.enddate, self.data.startdate)) {
      self.setData({
        showtoast: false,
        toastMsg: '起始日期不能大于结束日期'
      });
      setTimeout(function () {
        self.setData({
          showtoast: true,
        });
      }, 2000)
      return false;
    };
    //限制只能查询三十天内的数据
    var start = new Date(self.data.startdate.slice(0, 11));
    var end = new Date(self.data.enddate.slice(0, 11));
    var days = (end - start) / (1000 * 3600 * 24);
    if (days > 31) {
      self.setData({
        showtoast: false,
        toastMsg: '最多只能查询30天内数据'
      });
      setTimeout(function () {
        self.setData({
          showtoast: true,
        });
      }, 2000)		
      return;
    };
    util.requestData('zy.operation', {
      startTime: this.data.startdate,
      endTime: this.data.enddate,
      type: '3',
      platformCode: self.data.platforms[self.data.index].platformCode,
      dataType: self.data.currentType
    }, wx.getStorageSync('sessionid'),
      function (res) {
        var platData = res.platformTotal, datalist = res.resultList,
          _platData = [], totalOrders = 0, totalWeightData = 0, totalHandover = 0,
          totalcompletionRate = 0, totalhandoverRate = 0;
        function showAll() {
          for (var key in platData) {
            _platData.push(platData[key]);
          };
          //console.log(_platData); 
          _platData.forEach(function(item){
              totalOrders += item.orderTotal;
              totalWeightData += item.alreadyWeighing;
              totalHandover += item.handover;
          });                 
          if (totalOrders != 0) {
            totalhandoverRate = (totalHandover / totalOrders * 100).toFixed(1) + '%';
            totalcompletionRate = (totalWeightData / totalOrders * 100).toFixed(1) + '%';
          };

        }
        function showData(flag) {
          if (flag === '全部仓库') {
            showAll();
          };
          console.log(flag);
          datalist.forEach(function (item, index) {
            var _curcomplete = 0;
            if (item.completionRate != 0) {
              _curcomplete = item.completionRate + '%';
            };
            //console.log(item)
            if (item.warehouseName === flag) {
              _platData.push(item);
              //合计数据
              totalOrders = item.orderTotal;
              totalWeightData = item.alreadyWeighing;
              totalHandover = item.handover;
              if (totalOrders != 0) {
                totalhandoverRate = (totalHandover / totalOrders * 100).toFixed(1) + '%';
                totalcompletionRate = (totalWeightData / totalOrders * 100).toFixed(1) + '%';
              };
            };
          });

          self.setData({
            totalOrder: res.total.orderTotal,
            totalHandoverCompletionRate: res.total.totalHandoverCompletionRate + '%',
            totalWeighedCompletionRate: res.total.totalWeighedCompletionRate + '%',
            listData: _platData,
            totalOrders: totalOrders,
            totalWeightData: totalWeightData,
            totalHandover: totalHandover,
            totalhandoverRate: totalhandoverRate,
            totalcompletionRate: totalcompletionRate
          });
        };
        showData(flag);
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    this.requestData(this.data.currentIndex);
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