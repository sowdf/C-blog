var crypto = require('crypto'),
    User = require('../models/user.js');
/* GET home page. */
module.exports = function(app){
  app.get('/', function(req, res, next) {
    res.render('index', {
      title:'主页',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.get('/reg', function(req, res, next) {
    res.render('reg', {
      title: '注册',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/reg',function(req,res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];

    //检查用户两次输入密码是否一致
    if(password != password_re){
      req.flash('error','两次密码输入不一致');
      return res.redirect('/reg');
    }
    //生成密码的md5值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name:name,
      password:password,
      email:req.body.email
    });
    //检查用户名是否存在
    User.get(newUser.name,function(err,user){
      if(err){
        req.flash('error','用户名已存在');
        return res.redirect('/reg');
      }
      //如果不存在则新增用户
      newUser.save(function(err,user){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        req.session.user = newUser;//用户信息存入session
        req.flash('success','注册成功！');
        res.redirect('/');//注册成功返回主页
      });
    });
  });
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name,function(err,user){
      if(!user){
        req.flash('err','用户不存在！');
        return res.redirect('/login');
      }
      //检查密码是否一致
      console.log(user.password);
      if(user.password != password){
        req.flash('error','密码错误');
        return res.redirect('/login')
      }
      //密码正常后，将信息存入session
      req.session.user = user;
      req.flash('success','登录成功！');
      res.redirect('/');//登陆成功后跳转到主页
    })
  });
  app.get('/post', function (req, res) {
    res.render('post', { title: '发表' });
  });
  app.post('/post', function (req, res) {
  });
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success','登出成功');
    res.redirect('/')//退出成功后返回主页
  });
}


