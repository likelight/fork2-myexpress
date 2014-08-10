var methods = require("methods");

//route 用于 处理不同的http请求
function makeRoute( ){
	var route = function(req,res,next){
		req.route = route;
		return route.handler(req,res,next);
	};

	route.stack = [];
	route.handler = function(req,res,outnext){
		var stack = this.stack;
		var index = 0;		
		var next = function(err){
			if(err == 'route'){
				//若出现next('route')情况
				if(outnext){
					return outnext();
				}
			}

			if(err){
				throw err;
			}
			//获取中间件
			var route_layer = stack[index++];
			if(route_layer){
				if(route_layer.verb.toUpperCase() == 'ALL'){
					//若为all方法，则所有相同路径各种verb都支持
					route_layer.handler(req,res,next);
				}
				if(route_layer.verb.toUpperCase() == req.method){
					
					route_layer.handler(req,res,next);
				}else{
					next();
				}
			}else{
				res.statusCode = 404;
				res.end();
				//next();
			}
			
		}
		next();
	};

	route.use = function(method,handle_function){
		//http 请求变大写
		var layer = {'verb':method,'handler':handle_function};
		this.stack.push(layer);
	};

	route.all = function(handle_function){
		route.use("all",handle_function);
	}
	//定义route的各类方法
	methods.forEach(function(method){
    	route[method] = function(handle_function){
    		route.use(method,handle_function);
    		return route;
    	};
    });

	//用于链式写法
	return route;
}



module.exports = makeRoute;