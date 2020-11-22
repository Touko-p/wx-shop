// pages/feedback/index.js
/*
  1 点击 ’+‘ 触发tap点击事件
    1 调用小程序内置的 选择照片的api
    2 获取到 图片的路径 数组
    3 把图片路径存到data的变量中
    4 页面根据图片数组进行循环显示 自定义组件
  2 点击 自定义图片 组件
    1 获取被点击的元素的索引
    2 获取data中的图片数组
    3 根据索引 数组中删除对应的元素
    4 把数组重新设置回data中
  3 点击提交
    1 获取文本域的内容
      1 data中定义变量 表示 输入框内容
      2 文本域 绑定输入事件 事件触发的时候 把输入框的值 存入到变量中
    2 对这些内容 合法性验证
    3 验证通过 用户选择的图片 上传到专门的图片服务器 返回图片外网的链接
      1 遍历图片数组
      2 挨个上传
      3 自己再维护图片数组 存放 图片上传后的外网的链接
    4 文本域 和 外网的图片的路径 一起提交到服务器 //前端模拟
    5 清空当前页面
    6 返回上一页
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs:[
      {
        id:0,
        value:"体验问题",
        isActive:true
      },
      {
        id:1,
        value:"商品、商家投诉",
        isActive:false
      },
    ],
    //被选中的图片路径 数组
    chooseImgs:[],
    //文本域内容
    textValue:''
  },
  // 外网的图片路径数组
  uploadImgs:[],
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
  //点击加号选择图片
  handleChooseImg(){
    // 调用小程序内置的选择图片api
    wx.chooseImage({
      //同时选中图片的数量
      count:9,
      //图片的格式 原图 压缩
      sizeType:['original','compressed'],
      // 图片的来源 相册 照相机
      sourceType:['album','camera'],
      success:(result => {
        this.setData({
          // 图片数组 进行拼接
          chooseImgs:[...this.data.chooseImgs,...result.tempFilePaths]
        })
      })
    })
  },
  // 点击自定义图片组件
  handleRemoveImg(e){
    // 获取被点击的组件索引
    const {index}=e.currentTarget.dataset;
    // 获取data中的图片数组
    let {chooseImgs}=this.data;
    // 删除元素
    chooseImgs.splice(index,1);
    this.setData({
      chooseImgs
    })
  },
  //文本域输入事件
  handleTextInout(e){
    this.setData({
      textValue:e.detail.value
    })
  },
  //提交按钮点击
  handleFormSubmit(){
    //获取文本域内容 图片数组
    const {textValue,chooseImgs}=this.data;
    //合法性的验证
    if(!textValue.trim()){
      //不合法
      wx.showToast({
        title:'输入不合法',
        icon:'none',
        mask:true
      })
      return ;
    }
    //准备上传图片到专门的图片服务器
    //上传图片的api不支持多个文件同时上传 遍历数组 挨个上传
    wx.showLoading({
      title:'正在上传中',
      mask:true
    })
    if (chooseImgs.length!=0){
      chooseImgs.forEach(((value, index) => {
        wx.uploadFile({
          //图片要上传到哪里
          url:'https://img.coolcr.cn/api/upload',
          //被上传的文件路径
          filePath:value,
          //上传文件的名称 后台来获取文件 file
          name:'image',
          //顺带的文件信息
          formData:{},
          success:(result => {
            console.log(result);
            let url=JSON.parse(result.data);
            this.uploadImgs.push(url.data.url);

            //所有的图片都上传完毕了才触发
            if (index===chooseImgs.length-1){
              wx.hideLoading();
              console.log('提交至后台')
              this.setData({
                textValue: '',
                chooseImgs: []
              })
              wx.navigateBack({
                delta:1
              })
            }
          })
        })
      }))
    }
    else {
      console.log('仅提交文本')
      wx.hideLoading()
      wx.navigateBack({
        delta:1
      })
    }
  }
})