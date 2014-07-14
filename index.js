var http = require("http");
var Layer = require("./lib/layer.js");

module.exports = function(){
			
	//add an app to deal with request
	var app = function(req,res,next){
		req.app = app;
		return app.handle(req,res,next);
	}

	app.handle = function(req,res,next){
		var index = 0;
		var stack = app.stack;

		if(stack.length == 0){
			res.statusCode = 404;
			res.end("Not found");
		}else{
			for(var i = 0 ; i < stack.length; i++){
				console.log(stack[i].path);
			}	
			var url = req.url;
			var next = function(err){
			
				var middleware_layer = stack[index];
				var match_result = middleware_layer.match(url);
		
				if(match_result){
					// 如果匹配路径则执行对应操作
					middleware = middleware_layer.handle;
					if(typeof(middleware) == 'undefined'){
						if(err){
							res.statusCode = 500;
							res.end();
						}else{
							res.statusCode = 404;
							res.end("not found");
						}
						return;
					}else{
						var arg_length = middleware.length;
						index ++;
						try{
							console.log("2");
							if(err){
							// if quified the format 
								if(arg_length == 4){
									middleware(err,req,res,next);
								}else{
									next(err);
								}
							}else{
								// if not err
								if(arg_length == 3){
									middleware(req,res,next);
								}else if(arg_length == 2){
									middleware(req,res);
								}else{
									next();
								}
							}
						}catch(err){
								res.statusCode = 500;
								res.end();
						}
					}
				}else{
					//否则 next
					index++;
					next();
				}									
				
			};
			next();
		}

	};

	app.stack = [];
		
	//add listen function to listen port
	app.listen = function(port,done){
		var server = http.createServer(app);
		return server.listen(port,done);
	};
	// stack is a middleware collections
	
	app.use = function(path,middleware){
		if('string' != typeof(path)){
			middleware = path;
			path = '/';
		}
		var layer = new Layer(path,middleware);
		this.stack.push(layer);
		return app;		
	};

	return app;
}


