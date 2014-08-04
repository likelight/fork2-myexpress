var http = require("http");
var proto = {};
proto.isExpress = true;
proto.__proto__ = http.IncomingMessage.prototype;
proto.redirect = function(statusCode, path){
	if(!path){
		statusCode = 302;
		path = statusCode;
	}
	else{
		this.statusCode = statusCode;
		this.setHeader('Location', path);
		this.setHeader('Content-Length', 0);
 		this.end();
	}
}
module.exports = proto;