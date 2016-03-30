var mongodb = require('./db.js');
function Post(name,title,post){
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

//存储一篇文章及相关信息
Post.prototype.save = function(callback){
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date : date,
        year : date.getFullYear(),
        month : date.getFullYear() + '-' + (date.getMonth() + 1),
        day : date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        minute : date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes()<10 ? '0'+date.getMinutes() : date.getFullYear())
    }
    //要存入的数据库的文档
    var post = {
        name : this.name,
        time : time,
        title : this.title,
        post : this.post
    }
    //打开数据
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);//返回err为Null
            })
        })
    })
}
//读取文章信息
Post.get = function(name,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            
            collection.findOne('name',{safe:true},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }

            })
        })
    })
}