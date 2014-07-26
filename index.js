var http = require("http");
var Layer = require("./lib/layer.js");
var makeRoute = require("./lib/route");
var methods = require("methods");

module.exports = function() {

    //add an app to deal with request
    var app = function(req, res, next) {
        req.app = app;
        return app.handle(req, res, next);
    }
    //用于存储app.use记录的中间件
    app.stack = [];
    //handle method to deal with the real request
    app.handle = function(req, res, outnext) {
        var stack_index = 0; //stack的索引
        var stack = app.stack;
        var removed = '';
        req.params = [];
        var old_url = req.url; //记录初次访问路径，以供访问路径在经过subapp时候的修改还原
        var url_modified_status = 0; // url修改标志符 0：未修改；1：已修改
        //获得访问路径			
        var next = function(err) {
            var middleware_layer = stack[stack_index++];
            //若路径被修改过时，进行还原
            if (url_modified_status) {
                url_modified_status = 0;
                req.url = old_url;
            }

            if (middleware_layer) {
                var result = middleware_layer.match(req.url);
                if (result) {
                    req.params = result.params;
                    var middleware = middleware_layer.handle;
                } else {
                    req.params = {};
                    return next(err);
                }
                //含有subapp的情况
                if (typeof middleware.handle == 'function') {
                    var remote = middleware_layer.path;
                    //含有subapp时需要对路径进行截取，去除前端路径
                    req.url = req.url.replace(remote, "");
                    if (req.url[0] != '/') {
                        req.url = '/';
                    }
                    url_modified_status = 1;
                    middleware.handle(req, res, next);
                } else {
                	//正常非subapp情况
                    try {
                        //普通middle layer
                        if (err) {
                            if (middleware.length == 4) {
                                middleware(err, req, res, next);
                            } else {
                                next(err);
                            }
                        } else {

                            if (middleware.length < 4) {
                                middleware(req, res, next);
                            } else {
                                next();
                            }
                        }
                    } catch(err) {                
                        next(err);
                    }

                }

            } else {
                //没有middlerware时直接返回
                if (err) {
                	//若是subapp处理逻辑返回parentapp的处理逻辑
                    if (outnext) {
                        outnext(err);
                    } else {
                        res.statusCode = 500;
                        res.end();
                    }
                } else {
                	//若是subapp处理逻辑返回parentapp的处理逻辑
                    if (outnext) {
                        outnext();
                    } else {
                        res.statusCode = 404;
                        res.end();
                    }
                }

                return;

            }

        };

        next();
    };


    //add listen function to listen port
    app.listen = function(port, done) {
        var server = http.createServer(app);
        return server.listen(port, done);
    };
    // stack is a middleware collections
    app.use = function(path, middleware) {
        //
        if ('string' !== typeof(path)) {
            middleware = path;
            path = '';
        }
        var layer = new Layer(path, middleware);
        this.stack.push(layer);
        return app;
    };

    //app.get method
    app.get = function(path,middleware){  	
  		var handle = middleware;
  		var fn = makeRoute('GET',handle);
    	var layer = new Layer(path,fn,true);
    	this.stack.push(layer);
    	return app;
    };

    //定义各种verb处理函数
    methods.forEach(function(method){
    	app[method] = function(path,middleware){
    		var fn = makeRoute(method.toUpperCase(),middleware);
    		var layer = new Layer(path,fn,true);
    		this.stack.push(layer);
    		return app;
    	};
    });

    //

    return app;
}