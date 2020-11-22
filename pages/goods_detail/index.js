/**
 * 1 发送请求，获取数据
 * 2 点击轮播图预览大图
 *  1 给轮播图绑定点击事件
 *  2 调用小程序的api wx.previewImage
 * 3 点击加入购物车
 *  1 先绑定点击事件
 *  2 获取缓存中的购物车数据 数组格式
 *  3 先判断 当前商品是否存在购物车
 *  4 已存在 修改商品数据 商品数量++ 重新把购物车数组 填充回缓存中
 *  5 不存在于购物车数组 给购物车数组添加新元素 新元素 带上 购买属性 购买属性 num 重新把购物车数组 填充会缓存
 *  6 弹出提示
 * 4 商品收藏
 *  1 页面onShow的时候 加载缓存中的商品收藏的数据
 *  2 判断当前商品是不是被收藏
 *      1 是 改变页面的图标
 *      2 不是
 *  3 点击商品收藏按钮
 *      1 判断该商品是否存在于缓存数组中
 *      2 已经存在 删除商品
 *      3 没有存在 把商品添加到收藏数组中 存入缓存中即可
 */

import {request} from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
import {showToast} from "../../utils/asyncWx";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        goodsObj: {},
        //判断商品是否收藏
        isCollect:false
    },
    // 商品对象
    goodsInfo: {},
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    //获取商品详情数据
    async getGoodsDetail(goods_id) {
        const goodsObj = await request({url: '/goods/detail', data: {goods_id}});
        this.goodsInfo = goodsObj;
        // console.log(res)
        // 1 获取缓存中的商品收藏的数组
        let collect=wx.getStorageSync("collect")||[];
        // 2 判断当前商品是否收藏
        let isCollect=collect.some(value => value.goods_id===this.goodsInfo.goods_id);
        this.setData({
            goodsObj: {
                goods_name: goodsObj.goods_name,
                goods_price: goodsObj.goods_price,
                // iphone部分手机不识别 .webp图片样式
                // 最好找后台进行修改
                // 临时自己改 确保后台存在 .webp=>.jpg
                goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg'),
                pics: goodsObj.pics
            },
            isCollect
        })
    },
    //预览图片
    handlePreviewImage(e) {
        // 1 构造的要预览的图片数组
        const urls = this.goodsInfo.pics.map(value => value.pics_mid);
        // 2 接收传递过来的参数
        const current = e.currentTarget.dataset.url;
        wx.previewImage({
            current,
            urls
        })
    },
    //点击加入购物车
    handleCartAdd() {
        // 获取缓存中的购物车数组
        let cart = wx.getStorageSync("cart") || [];
        // 判断商品对象是否存在于购物车数组中
        let index = cart.findIndex(value => value.goods_id === this.goodsInfo.goods_id);

        if (index === -1) {
            // 不存在 第一次添加
            this.goodsInfo.num = 1;
            this.goodsInfo.checked = true;
            cart.push(this.goodsInfo);
        } else {
            // 已经存在购物车数据 执行 num++
            cart[index].num++;
        }
        // 把购物车重新添加回缓存中
        wx.setStorageSync("cart", cart);
        wx.showToast({
            title: '加入成功',
            icon: 'success',
            mask: true
        })
    },
    //点击 商品收藏图标
    async handleCollect(){
        let isCollect=false;
        // 1 获取缓存中的商品收藏数组
        let collect=wx.getStorageSync("collect")||[];
        // 2 判断该商品是否被收藏过
        let index=collect.findIndex(value => value.goods_id===this.goodsInfo.goods_id);
        // 3 当index!=-1 表示已经收藏
        if(index!=-1){
            // 能找到 已收藏 在数组中删除
            collect.splice(index,1)
            isCollect=false;
            await showToast({title:'取消收藏'});
        }else {
            // 没有收藏过
            collect.push(this.goodsInfo)
            isCollect=true;
            await showToast({title:'收藏成功'});
        }
        // 4 把数组存入到缓存中
        wx.setStorageSync("collect",collect);
        // 5 修改data中的属性 isCollect
        this.setData({
            isCollect
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
        let pages=getCurrentPages();
        let currentPage=pages[pages.length-1];
        let options=currentPage.options;
        const {goods_id} = options;
        this.getGoodsDetail(goods_id);
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