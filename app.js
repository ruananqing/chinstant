/**
 * Created by ruananqing on 2017/1/21.
 */
var express = require("express");
var app = express();

//配置socket.io的信息
var http  = require("http").Server(app);
var io = require("socket.io")(http);


//配置session的信息
var session = require("express-session");
app.use(session({
    secret: "keyboard cat",
    resave: false,
    cookie:{
        maxAge:1000*60  //过期时间设置(单位毫秒)
    },
    saveUninitialized:true
}));

//配置静态服务
app.use(express.static("./public"));

//此数组用于保存用户名
var allUserName = [];

app.set("view engine", "ejs");
//中间件
//显示登录页面
app.get("/",function (req, res, next) {
    res.render("index");
});
//确认登陆,检查此用户的用户名是否已经存在（昵称不能重复）
app.get("/check", function (req, res, next) {
    var username = req.query.username;
    if (!username) {
        res.send("先填写用户用户名，再进入聊天室！");
        return;
    }
    if (allUserName.indexOf(username) != -1){
        res.send("当前用户名已占用，请输入新的用户名！");
        return;
    }
    allUserName.push(username);
    req.session.username = username;
    res.redirect("/chat");

});

app.get("/chat", function (req, res, next) {
    //这个页面必须保证有用户名
    if (!req.session.username) {
        res.redirect("/");
        return;
    }
    res.render("chat", {
        "username": req.session.username
    });

});


io.on("connection", function (socket) {
    socket.on("clientMsg", function (msg) {
        io.emit("listMsg", msg);
    });

});



http.listen(3000);