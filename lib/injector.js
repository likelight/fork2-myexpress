'use strict';
// 定义转换函数
function createInjector(handler,app){

	var injector = function(req,res,next){
		var loader = injector.dependencies_loader(req,res,next);		
		loader(function(err,values){
			if(err){
				next(err);
			}else{
				handler.apply(this,values);
			}
		});
	};
	
	injector.extract_params = function () {
		var fnText = handler.toString();

		if (injector.extract_params.cache[fnText]) {
			return injector.extract_params.cache[fnText];
		}

		var FN_ARGS        = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
		var FN_ARG_SPLIT   = /,/;
		var FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/;
		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

		var inject = [];
		var argDecl = fnText.replace(STRIP_COMMENTS, '').match(FN_ARGS);

		argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
			arg.replace(FN_ARG, function(all, underscore, name) {
				inject.push(name);
			});
		});
		injector.extract_params.cache[handler] = inject;

		return inject;
	};

	injector.extract_params.cache = {};

	injector.dependencies_loader = function(req,res,next){
		
		var loader= function(fn){
			var err = null;
			var values = [];
			var i = 0;
			var params = injector.extract_params();

			var default_params = {'req':req,'res':res,'next':next};
			Object.keys(default_params).forEach(function (key) {
				app.factory(key, function (req, res, next) {
					next(null, default_params[key]);
				});
			});

			function _next(error,value){
				//todo 
				if (value) {
					values.push(value);
				}
				if (error) {
					err = error;
					return;
				}

				var name = params[i];
				i++;


				if(name){
					var handler = app._factories[name];
					if(handler){
						try{
							handler(req,res,_next);
						}catch(e){
							err = e;
							return;
						}

					}else{
						err = new Error('Factory not defined: '+name);
						return;
					}
				}

				
			}

			_next();
			//回调函数执行
			fn(err,values);

		};

		return loader;

	};

	return injector;
}



module.exports = createInjector;

