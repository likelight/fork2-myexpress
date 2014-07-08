var express = require("../index");
var request = require("supertest");
var expect = require("chai").expect;
var http = require("http");
describe("app",function(){
	var app = express();
	// 测试创建server
	describe("create http server",function(){
		it("should return an httpserver",function(){
			 expect(app).to.be.a('function');
			//expect(app).be.instanceof(http.Server);
		});
		it("should respond 404",function(done){
			request(app)
			.get("/foo")
			.expect(404)
			.end(done);
		});
	});
	// 测试listen方法
	describe("#listen",function(){
		var ret;
		before(function(done){
			ret = app.listen(4000,done);
		});

		it("listen to 4000",function(){	
			expect(ret).to.be.instanceof(http.Server);			
		});
		it("respond to /foo with 404",function(done){
			request("http://localhost:4000").get("/foo").expect(404).end(done);
		});
	});
});

