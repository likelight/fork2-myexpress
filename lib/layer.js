var p2re = require("path-to-regexp");

function Layer(path,middleware){
	this.names = [];
	this.path = decodeURIComponent(path);
	this.path = path.replace(/\/$/, "");
	this.re = p2re(this.path,this.names,{end:false});
	this.handle = middleware;
	
};

Layer.prototype.match = function(newRoute){
	var newRoute = decodeURIComponent(newRoute);
	if(this.re.test(newRoute)){
		var dict = {};
		var param = [];
		param = this.re.exec(newRoute);
		for(var i = 0; i < this.names.length; i++){
			dict[this.names[i].name] = param[i+1];
		}
		return {path:param[0],params:dict};

	}else{
		return undefined;
	}
}

module.exports = Layer;