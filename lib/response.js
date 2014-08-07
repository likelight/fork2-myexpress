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
 	if('string' == typeof type){
 		if(type[0] === "."){
 			type.substr(1);
 			//console.log(type);
 			var content_type = mime.lookup(type);
 			this.setHeader('Content-Type',content_type);
 		}
 	}
 };

 proto.default_type = function(type){
 	if(!this.getHeader('content_type')){
 		type.substr(1);
 		var content_type = mime.lookup(type);
 		this.setHeader('Content-Type',content_type);
 	}
 }

 proto.format = function(type_map){
 	var format = Object.keys(type_map);
 	var accept = accepts(this.req);
 	var prefer_type = accept.type(format);
 	if(format.indexof(prefer_type) == -1){
 		this.statusCode = 406;
 		throw new Error("Not Acceptable");
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