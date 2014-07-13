var http = require("http");

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
			
			var next = function(err){
			
				var middleware = stack[index];

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
						if(err){
						// if quified the format 
							if(arg_length == 4){
								middleware(err,req,res,next);
							}else{
								next(err);
							}
						}else{
						
							// if not err
							if(arg_length < 4){
								middleware(req,res,next);
							}else{
								next();
							}
						}
					}catch(err){
						res.statusCode = 500;
						res.end();
					}
					

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
	
	app.use = function(middleware){
		var middleware;
		if(middleware.hasOwnProperty("stack")){
			for(var i in middleware.stack){
				this.stack.push(middleware.stack[i]);
			}
		}else{
				this.stack.push(middleware);
		}
		
	};

	return app;
}


// var http = require('http');

// var express = function(){

//     var app = function(request, response){

//         // middleware stack
//         var stack = app.stack;
//         // stack progress num
//         var stackProgress = 0;

//         if(stack.length === 0){
//             // no middleware
//             response.statusCode = 404;
//             response.end('not found');
//         }else{

//             var next = function(err){

//                 var middleware = stack[stackProgress];
                
//                 if(typeof middleware === 'undefined'){
//                     if(err){
//                         response.statusCode = 500;
//                         response.end();
//                     }else{
//                         response.statusCode = 404;
//                         response.end('not found');
//                     };
//                     return;
//                 }else{
//                     var argvLength = middleware.length;
//                     stackProgress ++;
//                     try{
//                         if(err){
//                             if(argvLength === 4){
//                                 middleware(err, request, response, next);
//                             }else{
//                                 next(err);
//                             }
//                         }else{
//                             if(argvLength < 4){
//                                 middleware(request, response, next);
//                             }else{
//                                 next();
//                             }
//                         }
//                     }catch(err){
//                         response.statusCode = 500;
//                         response.end();
//                     }
//                 }
                
//             };
//             // start call middleware
//             next();
//         }

//     };

//     app.stack = [];

//     app.listen = function(port, callback){

//         var port = port || 4000;
//         var callback = callback || function(){};

//         // creat server
//         var server = http.createServer(this);
//         server.listen(port, function(){
//             callback();
//         });

//         return server;

//     };
    
//     app.use = function(middleWare){
//         // console.log(middleWare instanceof app)
//         if(middleWare.hasOwnProperty('stack')){
//             for(var i in middleWare.stack){
//                 this.stack.push(middleWare.stack[i]);
//             }
//         }else{
//             this.stack.push(middleWare);
//         }

//     };

//     return app;

// };

// module.exports = express;