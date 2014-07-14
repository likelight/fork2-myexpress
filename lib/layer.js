var layer = function(path,middleware){
	if(path){
		this.path = path;
	}
	this.handle = middleware;
	this.match = function(url){
		if(url == this.path){
			return {path:this.path};			
		}else if(url.indexOf(this.path) >= 0){
			return {path:this.path};
			
		}else{
			//console.log(this.path + "url is "+url);
			return undefined;
		}
	};
};
module.exports = layer;