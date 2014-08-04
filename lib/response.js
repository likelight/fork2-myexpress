var http = require("http");
var proto = {};
proto.isExpress = true;

proto.redirect = function (statusCode, path) {
 	if (!path) {
 		path = statusCode;
 		statusCode = 302;
 	}
 	this.statusCode = statusCode;
 	this.setHeader('Location', path);
 	this.setHeader('Content-Length', 0);
 	this.end();
 }
proto.__proto__ =  http.ServerResponse.prototype;
module.exports = proto;