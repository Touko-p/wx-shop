/**
 * 1 获取用户的收货地址
 *  1 绑定点击事件
 *  2 调用小程序内置api获取用户的收货地址 wx.chooseAddress
 *
 *  2 获取用户对小程序所授予获取地址权限状态 scope
 *    1 假设用户点击获取收货地址的提示框确定  authSetting scope.address
 *      scope 值 true
 *    2 假设用户从来没有调用过 收货地址的api
 *    scope 值 undefined
 *  3 假设用户点击获取收货地址的提示框确定
 *      scope 值 false
 *    1 诱导用户自己打开授权设置页面(wx.openSetting) 当用户重新重新给与获取地址权限的时候
 *    2 获取收货地址
 *  4 把获取到的收货地址存入到 本地存储中
 * 2 页面加载完毕
 *  1 获取本地存储中的地址数据
 *  2 把数据设置给data中的一个变量
 * 3 onShow
 *  0 回到了商品详情页面 第一次添加商品的时候 手动添加了属性
 *    1 num=1
 *    2 checked=true
 *  1 获取缓存中的购物车数据
 *  2 把购物车数据 填充到data
 * 4 全选的实现 数据的展示
 *  1 onShow 获取缓存中的购物车数组
 *  2 根据购物车中的商品数据 所有的商品都被选中 checked=true 全选就被选中
 * 5 总价格和总数量
 *  1 需要商品被选中
 *  2 获取购物车数组
 *  3 遍历
 *  4 判断商品是否被选中
 *  5 总价格+=商品的单价*商品的数量
 *  6 总数量+=商品的数量
 *  7 把计算后的价格和数量 设置会data中即可
 * 6 商品的选中
 *  1 绑定change事件
 *  2 获取到被修改的商品对象
 *  3 商品对象的选中状态 取反
 *  4 重新填充回data中和缓存中
 *  5 重新计算 全选 总价格 总数量
 * 7 全选和反选
 *  1 全选复选框绑定事件 change
 *  2 获取 data中的全选变量 allChecked
 *  3 直接取反 allChecked!=allChecked
 *  4 遍历购物车数组 商品选中状态跟随 allChecked 改变而改变
 *  5 把购物车数组 和 allChecked 重新设置回data 把购物车重新设置回缓存中
 * 8 商品数量的编辑
 *  1 '+' '-' 按钮绑定同一个事件 区分的关键 自定义属性
 *      1 ‘+’ +1
 *      2 ‘-’ -1
 *  2 传递被点击的商品id goods_id
 *  3 获取data中的购物车数组 来获取需要被修改的商品对象
 *      当购物车数量=1 同时用户点击 ‘-’ 弹出提示用户是否要删除（showModal）
 *      1 确定 执行删除
 *      2 取消 什么都不做
 *  4 直接修改商品对象的数量 num
 *  5 把cart数组 重新设置回 缓存中 和data中 this.setCart
 *

 */
import {getSetting, chooseAddress, openSetting, showModel,showToast} from "../../utils/asyncWx";
import regeneratorRuntime from "../../lib/runtime/runtime";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        address: {},
        cart: [],
        allChecked: false,
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
    //商品选中
    handleItemChange(e) {
        // 获取被修改的商品id
        const goods_id=e.currentTarget.dataset.id;
        // 获取购物车数组
        let {cart}=this.data;
        // 找到被修改的商品对象
        let index=cart.findIndex(value => value.goods_id===goods_id);
        // 选中状态取反
        cart[index].checked=!cart[index].checked;

        this.setCart(cart);

    },
    //商品全选
    handleItemAllCheck(){
        // 获取data中的数据
        let {cart,allChecked}=this.data;
        // 修改值
        allChecked=!allChecked;
        // 循环修改cart数组 中的商品选中状态
        cart.forEach(value => value.checked=allChecked);
        // 把修改后的值 填充回data或者缓存中
        this.setCart(cart);
    },
    //商品数量编辑
    async handleItemNumEdit(e){
        //  获取传递过来的参数
        const {operation,id}=e.currentTarget.dataset;
        //  获取购物车数组
        let {cart}=this.data;
        //  找到需要修改的商品的索引
        const index=cart.findIndex(value => value.goods_id===id);
        //  判断是否执行删除
        if(cart[index].num===1&&operation===-1){
            //  弹窗提示
            // wx.showModal({
            //     title:'提示',
            //     content:'您是否删除商品？',
            //     success:(result)=>{
            //         if (result.confirm){
            //             cart.splice(index,1);
            //             this.setCart(cart);
            //         }else if(result.cancel){
            //             console.log('用户点击取消')
            //         }
            //     }
            // })
            const result=await showModel({content:"您是否要删除"});
            if (result.confirm){
                cart.splice(index,1);
                this.setCart(cart);
            }else if(result.cancel){
                console.log('用户点击取消')
            }
        }else {
            //  进行修改数量
            cart[index].num+=operation;
            //  设置回缓存data中
            this.setCart(cart);
        }
    },
    //支付结算
    async handlePay(){
        const {address,totalNum}=this.data;
        //判断地址是否为空
        if(!address.userName){
            await showToast({title:'您还没有选择收货地址'});
            return;
        }
        //判断用户购物车是否为空
        if(totalNum===0){
            await showToast({title: '您还没选择商品'});
            return;
        }
        //页面跳转
        wx.navigateTo({
            url:'/pages/pay/index'
        })
    },
    //  设置购物车状态的同时 重新计算 底部工具栏的数据 全选 总价格 购买的数量
    setCart(cart){
        let allChecked = true;
        //  总价格 总数量
        let totalPrice = 0;
        let totalNum = 0;
        cart.forEach(value => {
            if (value.checked) {
                totalPrice += value.num * value.goods_price;
                totalNum += value.num;
            } else {
                allChecked = false;
            }
        })
        //  判断数组是否为空
        allChecked = cart.length != 0 ? allChecked : false;
        //  给data赋值
        this.setData({
            cart,
            totalPrice,
            totalNum,
            allChecked
        })
        // 把购物车重新设置回data和缓存中
        wx.setStorageSync("cart",cart);
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
        const cart = wx.getStorageSync("cart") || [];
        //  计算全选
        //  every 数组方法 会遍历 会接收一个回调函数 那么 每一个回调函数都返回true那么every方法的返回值为true
        //  只要有一个回调函数返回false 那么不再循环执行，直接返回false
        //  空数组 调用 every，返回值就是true
        // const allChecked=cart.length?cart.every(value => value.checked):false;

        this.setData({
            address
        })

        this.setCart(cart);
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