/*
    1 页面加载的时候
        1 从缓存中获取购物车数据 渲染到页面中
        这些数据 checked=true
    2 微信支付
        1 那些人 那些账号 可以实现微信支付
            1 企业账号
        2 企业账号的小程序后台中 必修 给开发者 添加上白名单
            1 一个appid可以同时绑定多个开发者
            2 这些开发者就可以公用这个appid和它的开发权限
    3 支付按钮
        1 先判断缓存中有无token
        2 没有 跳转到授权页面 进行获取token
        3 有token
        4 创建订单 获取订单编号
        5 已经完成了微信支付
        6 手动删除缓存中 已经被选中的商品
        7 删除后的购物车数据 填充胡缓存
        8 跳转页面

 */
import {request} from "../../request/index.js";
import {getSetting, chooseAddress, openSetting, showModel,showToast,requestPayment} from "../../utils/asyncWx";
import regeneratorRuntime from "../../lib/runtime/runtime";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        address: {},
        cart: [],
        totalPrice: 0,
        totalNum: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    //点击收货地址
    async handleChooseAddress() {
        // 1 获取权限状态
        // wx.getSetting({
        //   success:(result => {
        //     // 2 获取权限状态 主要发现一些 属性名很怪异的时候 都要使用 [] 形式来获取属性值
        //     const scopeAddress=result.authSetting["scope.address"];
        //     if (scopeAddress===true||scopeAddress===undefined){
        //       wx.chooseAddress({
        //         success:(result1 => {
        //           console.log(result1)
        //         })
        //       })
        //     }else {
        //       // 3 用户以前拒绝过授予权限 先诱导用户打开授权界面
        //       wx.openSetting({
        //         success:(result1 => {
        //           // 4 可以调用 收货收货地址代码
        //           wx.chooseAddress({
        //             success:(result2 => {
        //               console.log(result2)
        //             })
        //           })
        //         })
        //       })
        //     }
        //   })
        // });
        try {
            // 1 获取权限状态
            const res1 = await getSetting();
            const scopeAddress = res1.authSetting["scope.address"];
            // 2 判断权限状态
            if (scopeAddress === false) {
                // 3 诱导用户打开授权界面
                await openSetting();
            }
            // 4 调用获取收货地址的api
            let address = await chooseAddress();
            address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo;
            // 5 存入到缓存中
            wx.setStorageSync("address", address);
        } catch (error) {
            console.log(error)
        }
    },
    // 点击支付
    async handleOrderPay(){
        try {
            // 判断缓存中有无token
            const token=wx.getStorageSync("token");
            if(!token){
                wx.navigateTo({
                    url:'/pages/auth/index'
                })
                return ;
            }
            // 创建订单
            // 准备请求头参数
            // const header={Authorization:token};
            // 准备请求体参数
            const order_price=this.data.totalPrice;
            const consignee_addr=this.data.address.all;
            const cart=this.data.cart;
            let goods=[];
            cart.forEach(value => goods.push({
                goods_id: value.goods_id,
                goods_number:value.num,
                goods_price:value.goods_price
            }))
            const orderParams={order_price,consignee_addr,goods}
            // 准备发送请求 创建订单 获取订单编号
            const {order_number}=await request({url:'/my/orders/create',method:'POST',data:orderParams})
            // 发起预支付的接口
            const {pay}=await request({url:'/my/orders/req_unifiedorder',method:'POST',data:{order_number}});
            // 发起微信支付
            await requestPayment(pay);
            // 查询后台 订单状态
            const res=await request({url:'/my/orders/chkOrder',method:'POST',data:{order_number}});
            await  showToast({title:'支付成功'})
            // 手动删除缓存中 已经支付了的商品
            let newCart=wx.getStorageSync("cart");
            newCart=newCart.filter(value => !value.checked);
            wx.setStorageSync("cart",newCart);
            // 支付成功 跳转到订单页面
            wx.navigateTo({
                url:'/pages/order/index'
            })
        }catch (e){
            await  showToast({title:'支付失败'})
            // 手动删除缓存中 已经支付了的商品
            let newCart=wx.getStorageSync("cart");
            newCart=newCart.filter(value => !value.checked);
            wx.setStorageSync("cart",newCart);
            // Test:支付失败 跳转到订单页面
            wx.navigateTo({
                url:'/pages/order/index'
            })
            console.log(e)
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完
     onReady: function () {

  },

     /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //  获取缓存中的收货地址信息
        const address = wx.getStorageSync("address");
        //  获取缓存中的购物车数据
        let cart = wx.getStorageSync("cart") || [];
        //  过滤后的购物车数组
        cart=cart.filter(value => value.checked);
        //  计算全选
        //  every 数组方法 会遍历 会接收一个回调函数 那么 每一个回调函数都返回true那么every方法的返回值为true
        //  只要有一个回调函数返回false 那么不再循环执行，直接返回false
        //  空数组 调用 every，返回值就是true
        // const allChecked=cart.length?cart.every(value => value.checked):false;

        this.setData({
            address
        })

        //  总价格 总数量
        let totalPrice = 0;
        let totalNum = 0;
        cart.forEach(value => {
                totalPrice += value.num * value.goods_price;
                totalNum += value.num;
        })
        //  给data赋值
        this.setData({
            cart,
            totalPrice,
            totalNum,
            address
        })
        // 把购物车重新设置回data和缓存中
        wx.setStorageSync("cart",cart);
    }
})