import {request} from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs:[
      {
        id:0,
        value:"综合",
        isActive:true
      },
      {
        id:1,
        value:"销量",
        isActive:false
      },
      {
        id:2,
        value:"价格",
        isActive:false
      },
    ],
    goodsList:[]
  },

  //接口要的参数
  QueryParams:{
    query:"",
    cid:"",
    pagenum:1,
    pagesize:10
  },
  // 总页数
  totalPages:1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.QueryParams.cid=options.cid||'';
    this.QueryParams.query=options.query||'';
    this.getGoodList();
  },

  //获取商品列表数据
  async getGoodList(){
    const res=await request({url:"/goods/search",data:this.QueryParams});
    //获取总条数
    const total=res.total;
    //计算总页数
    this.totalPages=Math.ceil(total/this.QueryParams.pagesize);
    // console.log(this.totalPages)
    this.setData({
      //拼接的数组
      goodsList:[...this.data.goodsList,...res.goods]
    })
    // 关闭下拉刷新的窗口 如果没有调用下拉刷新的窗口 直接关闭不会报错
    wx.stopPullDownRefresh();
  },

  // 标题点击事件 从子组件传递过来
  handleTabItemChange(e){
    // 获取被点击的标题索引
    const {index}=e.detail;
    // 修改元素组
    let {tabs}=this.data;
    tabs.forEach((v, i) =>i===index?v.isActive=true:v.isActive=false);
    //赋值到data中
    this.setData({
      tabs
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
  // 下拉刷新页面
  // 重置数据数组 重置页码 设置为1
  // 重新发送请求
  // 数据请求回来 需要手动的关闭 等待效果
  onPullDownRefresh: function () {
    // 重置数组
    this.setData({
      goodsList:[]
    })
    // 重置页码
    this.QueryParams.pagenum=1;
    // 发送请求
    this.getGoodList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  // 用户上滑页面 滚动条触底 加载下一页数据
  // 1 判断有无下一页数据
  // 2 获取总页数 只有总条数  总页数=Math.ceil(总条数 / 页容量 pagesize)  =Math.ceil( 23 / 10 ) = 3
  //   获取当前页码 pagenum
  // 3 判断当前页码是否大于或等于总页数
  // true：没有数据 弹出提示
  // false:有数据 加载下一页数据 1 当前页码++  2 重新发送请求 3 数据请求回来 要对data中的数组进行拼接而不是替换

  onReachBottom: function () {
    // 判断有无下一页数据
    if(this.QueryParams.pagenum>=this.totalPages){
      // 没有下一页数据
      wx.showToast({
        title:'没有下一页信息',
      })
    }else {
      // 有下一页数据
      this.QueryParams.pagenum++;
      this.getGoodList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})