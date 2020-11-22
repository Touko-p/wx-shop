// pages/search/index.js
/*
  1 输入框绑定 值改变事件 input事件
    1 获取输入框的值
    2 合法性判断
    3 检验通过 把输入的值发送到火腿
    4 返回的数据打印到页面
  2 防抖(防止抖动) 定时器  节流
    防抖 一般 输入框中 防止重复输入 重复发送请求
    节流 一般是在页面下拉和上拉
    1 定义全局的定时器id
 */
import {request} from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:[],
    timeId:-1,
    isFocus:false,
    inputValue:''
  },
  //输入框事件
  handleInput(e){
    //获取输入框的值
    const {value}=e.detail;
    //检测合法行
    if (!value.trim()){
      //值不合法
      this.setData({
        goods:[],
        isFocus:false
      })
      return ;
    }
    this.setData({
      isFocus:true
    })
    //准备发送请求数据
    clearTimeout(this.timeId);
    this.timeId=setTimeout(()=>{
      this.qSearch(value);
    },1000)
  },
  //点击取消事件
  handleCancel(){
    this.setData({
      inputValue:'',
      isFocus:false,
      goods:[]
    })
  },
  //发送请求获取搜索建议 数据
  async qSearch(query){
    const res=await request({url:"/goods/qsearch",data:{query}});
    console.log(res);
    this.setData({
      goods:res
    })
  }
})