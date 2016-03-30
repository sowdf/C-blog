var crypto = require('crypto'),
    User = require('../models/user.js');
/* GET home page. */
module.exports = function(app){
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });
  app.post('/reg',function(req,res){
    var name = req.body.name,
        password = req.body.password,
        password = req.body['password-repeat'];
    //检查用户两次输入密码是否一致
  })
}


