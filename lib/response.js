var mime = require("mime");
var http = require("http");
var accepts = require('accepts');
var Buffer = require('buffer').Buffer;
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
proto.type = function(type){
 	if(type[0] === "."){
 		type.substr(1);
 		var content_type = mime.lookup(type);
 		this.setHeader('Content-Type',content_type);
 	} else {
 		content_type = mime.lookup(type);
 		this.setHeader('Content-Type',content_type);
 	}
 };

 /*设置默认的Content-Type头部，用于标识资源类型*/
 proto.default_type = function(type){
 	if(!this.getHeader('Content-Type')){
 		var content_type = mime.lookup(type);
 		this.setHeader('Content-Type',content_type);
 		var result = this.getHeader('Content-Type');
 	} else {
 		
 	}
 }

 /*判断选择优先传输的格式，accept框架用于根据浏览器优先进行选择*/
 proto.format = function(type_map){
 	var format = Object.keys(type_map);
 	var accept = accepts(this.req);
 	var prefer_type = accept.type(format);
 	if(format.indexOf(prefer_type) == -1){
 		this.statusCode = 406;
 		this.end();
 	} else {
 		this.type(prefer_type);
 		type_map[prefer_type]();
 	}

 };

 proto.send = function(data){
 	if("string" == typeof data){
 		this.default_type("html");
 	}

 	if("object" == typeof data){
 		if(Buffer.isBuffer(data)){
 			this.default_type("bin");
 			this.setHeader("Content-Length",data.length);
 			
 		}else{
 			this.type("json");
 		}
 	}
 };
proto.__proto__ =  http.ServerResponse.prototype;
module.exports = proto;