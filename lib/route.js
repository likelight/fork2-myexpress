function makeRoute(verb,handler){
	return function(req,res,next){
		if(req.method == verb){
			handler(req,res,next);
		}else{
			res.statusCode = 404;
			res.end();
		}
	}
	
}


module.exports = makeRoute;