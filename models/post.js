var mongodb = require('./db.js'),
    markdown = require('markdown').markdown;
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
        post : this.post,
        comments:[]
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
Post.getTen = function(name,page,callback){
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
            var query = {}
            if(name){
                query.name = name;
            }
            //使用count返回特定查询的文档书total
            collection.count(query,function(err,total){
                //根据query对象查询，并跳过前(page-1)*10个结果，返回之后的10个 结果
                collection.find(query,{
                    skip:(page - 1) * 10,
                    limit:10
                }).sort({
                    time:-1
                }).toArray(function(err,docs){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            })
        })
    })
}
//获取一篇文章
Post.getOne = function(name,day,title,callback){
    //打开数据库
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
            //根据用户名，发表日期及文章名进行查询
            collection.findOne({
                'name':name,
                'time.day':day,
                'title':title,
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //解析markdown为html
                if(doc){
                    doc.post = markdown.toHTML(doc.post);
                    doc.comments.forEach(function (comment) {
                        comment.content = markdown.toHTML(comment.content);
                    });
                }
                callback(null,doc);
            })

        })
    })
}

//返回原来发表的内容（markdown 格式）
Post.edit = function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据用户名，发表日期及文章名进行查询
            collection.findOne({
                'name':name,
                'time.day':day,
                'title':title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);
            })
        })
    })
    //更新一篇文章及其相关
    Post.update = function(name,day,title,post,callback){
        //打开数据库
        mongodb.open(function(err,db){
            if(err){
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                //更新文章内容
                collection.update({
                    'name':name,
                    'time.day':day,
                    'title':title
                },{
                    $set:{post:post}
                },function(err){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    callback(null);
                })
            })
        })
    }
}
//删除一篇文章
Post.remove = function(name,day,title,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.remove({
                'name':name,
                'time.day':day,
                'title':title
            },{w:1},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}

Post.getArchive = function(callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({},{
                name : 1,
                time : 1,
                title : 1
            }).sort({
                time : -1
            }).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(docs);
            })
        })
    })
}
