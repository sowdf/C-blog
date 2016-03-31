var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('./models/comment.js');
/* GET home page. */
function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','未登录！');
    res.redirect('/login');
  }
  next();
}
function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登录！');
    res.redirect('back');//返回之前的登陆页面
  }
  next();
}

module.exports = function(app){
  app.get('/', function(req, res, next) {
      Post.getAll(null,function(err,posts){
          if(err){
              posts = [];
          }
          res.render('index', {
              title:'主页',
              posts:posts,
              user:req.session.user,
              success:req.flash('success').toString(),
              error:req.flash('error').toString()
          });
      })

  });
  app.get('/reg',checkNotLogin);
  app.get('/reg', function(req, res, next) {
    res.render('reg', {
      title: '注册',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/reg',checkNotLogin);
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
  app.get('/login',checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/login',checkNotLogin);
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
  app.get('/post',checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.get('/post',checkLogin);
  app.post('/post', function (req, res) {
      var currentUser = req.session.user,
          post = new Post(currentUser.name,req.body.title,req.body.post);
      post.save(function(err){
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          req.flash('success','发布成功！');
          res.redirect('/');//发表成功后跳转到主页
      });
  });
  app.get('/logout',checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success','登出成功');
    res.redirect('/')//退出成功后返回主页
  });
  app.get('/upload',checkLogin);
  app.get('/upload',function(req,res){
    res.render('upload',{
      title : '文件上传',
      user :req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  });
  app.post('/upload',checkLogin);
  app.post('/upload',function(req,res){
    req.flash('success','文件上传成功');
    res.redirect('/upload');
  });
  app.get('/u/:name',function(req,res){
    User.get(req,params.name,function(err,user){
      if(!user){
        req.flash('error','用户不存在！');
        return res.redirect('/');
      }
      //查询并返回用户的所有文章
      Post.getAll(user.name,function(err,posts){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('user',{
          title:user.name,
          posts:posts,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
      })
    })
  });
  app.get('/u/:name/:day/:title',function(req,res){
    Post.getOne(req.params.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('article',{
        title:req.params.title,
        post:post,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  });
  app.get('/edit/:name/:day/:title',checkLogin);
  app.get('/edit/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.edit(currentUser.name,req.params.day,req.params.title,function(err,post){
      if(err){
        req.flash('error',err)
        return res.redirect('back');
      }
      res.render('edit',{
        title:'编辑',
        post:post,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })
  app.post('/edit/:name/:day/:title',checkLogin);
  app.post('/edit/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err,post){
      var url = encodeURI('/u/' + req.params.name + '/' +req.params.day + '/' + req.params.title );
      if(err){
        req.flash('error',err);
        return res.redirect(url);//出错！
      }
      req.flash('success','修改成功！');
      res.redirect(url);
    })
  });
  app.get('/remove/:name/:day/:title',checkLogin);
  app.get('/remove/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.remove(currentUser.name,req.params.day,req.params.title,function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','删除成功！');
      res.redirect('/');
    })
  })
}


