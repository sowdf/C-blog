var mongodb = require('./db');
function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback){
    //要存入数据库的文档
    var user = {
        name: this.name,
        password : this.possword,
        email : this.email
    }
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);//返回错误信息
        }
        db.collection(users,function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将用户数据插入users集合
            collection.insert(uers,{
                safe:true
            },function(err,user){
                mongodb.close();;
                if(err){
                    return callback(err);
                }
                callback(null,user[0]);//成功，err为null，并返回储存后的用户文档
            });
        })
    })

}
User.get = function(name,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({
                name :name
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,user);//成功返回查询的数据
            })

        })
    });
}