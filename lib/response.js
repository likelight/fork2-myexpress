var mime = require("mime");
var http = require("http");
var accepts = require('accepts');
var Buffer = require('buffer').Buffer;
var crc32 = require('buffer-crc32');
var net = require("net");
var path = require("path");
var fs = require("fs");
var rparser = require("range-parser")
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

 proto.send = function(code,data){
 	if(arguments.length === 1){
 		if("number" === typeof code){
 			data = http.STATUS_CODES[String(code)];
 			this.statusCode = code;
 			//this.end(data);
 		} else {
 			data = code;
 			this.statusCode = 200;
 		} 
 		
 	} else if(arguments.length === 2){
 		this.statusCode = code;
 	}

 	if("string" == typeof data){
 		this.default_type("html");
 		this.setHeader('Content-Length', Buffer.byteLength(data));
 		
 	}else if (data instanceof Buffer){ 		
 		this.default_type("bin");
 		this.setHeader("Content-Length",data.length);
 					
 	} else if('object' === typeof data){
 		this.type("json");
 		data = JSON.stringify(data);
 		
 	} 
	
 	//设置内容etag用于检验是否服务器进行修改
 	if(data && this.req.method.toUpperCase() === 'GET' && !this.getHeader('Etag')){
 		var etag = crc32.unsigned(data);
 		this.setHeader('Etag','"'+etag+'"');
 	}

 	//判断如果文件内容未进行过修改则返回304
 
 	if (this.getHeader('ETag') && this.getHeader('ETag') === this.req.headers['if-none-match']) {
		this.statusCode = 304;
	}

 	if (this.getHeader('Last-Modified') <= this.req.headers['if-modified-since']) {
		this.statusCode = 304;
	}

 	this.end(data);
 };

proto.sendfile = function(data,options){
	var res = this;
	var opt = {};
	if(options && options.hasOwnProperty('root')){
		file_path = path.normalize(options.root+data);
	} else {
		file_path = data;
	}

	if(data.indexOf("..") > -1){
		return res.send(403);
	}

	fs.stat(file_path,function(err,stats){
		if(err){
			return res.send(404);
		} else {
			//判断文件夹名则返回403；
			if(stats.isDirectory()){
				return res.send(403);
			}
			//获取文件大小
			var size = stats.size;

			if(res.req.headers.range){
				var range = res.req.headers.range;
				var r = rparser(200,range);
				if(r == -1){
					//不满足的range头返回416
					return res.send(416);
				} else  if( r.length > 2 || r == -2) {
					//do nothing
				} else {
					res.statusCode = 206;
					res.setHeader('Content-Range',"bytes "+r[0].start+"-"+r[0].end+"/"+size);
					opt = r[0];
				}

			} else {
				//没有设置range头时进行设置
				res.setHeader('Accept-Range',"bytes");
			}

			res.setHeader('Content-Length',size);
			var file = fs.createReadStream(file_path,opt);
			res.stream(file);
			res.type(path.extname(file_path));
		}

	});
	
};

 proto.stream = function(content){
 	content.pipe(this);
 };

proto.__proto__ =  http.ServerResponse.prototype;
module.exports = proto;