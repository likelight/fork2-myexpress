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

	//test use function 
	describe(".use",function(){
		var m1 = function(){};
		var m2 = function(){};

		it("should be able to add middlewares to stack",function(){
			app.use(m1);
			app.use(m2);
			expect(app.stack.length).to.equal(2);

		});
	});

	describe("calling middlewares stack",function(){
		var app1;
		beforeEach(function(){
			app1 = new express();
		});
				
		it("should be able to call a single middlewares",function(done){
			var m1 = function(req,res,next){
				res.end("hello from m1");
			};
			app1.use(m1);
			request(app1)
			.get("/")
			.expect("hello from m1")
			.end(done);
		});

		it("should be able to call next to go to the next middlewares",function(done){
			var m1 = function(req,res,next){
				//res.send("hello from m1\n");
				next();
			};
			var m2 = function(req,res,next){
				res.end("hello from m2");
			} 
			app1.use(m1);
			app1.use(m2);
			request(app1)
			.get("/")
			.expect("hello from m2")
			.end(done)
		});

		it("should 404 at the end of middlewares chain",function(done){
			var m1 = function(req,res,next){
				next();
			}
			var m2 = function(req,res,next){
				next();
			}
			app1.use(m1);
			app1.use(m2);
			request(app1)
			.get("/")
			.expect(404)
			.end(done);
		});

		it("should 404 if no middleware is added",function(done){
			app1.stack = [];
			request(app1)
			.get("/")
			.expect(404)
			.end(done);
		});

	});

	describe("Implement Error Handling",function(){
		var app;
		beforeEach(function(){
			app = new express();
		});
		it("should return 500 for unhandled error",function(done){
			var m1 = function(req,res,next){
				next(new Error("boom!"));
			};
			app.use(m1);
			request(app)
			.get("/")
			.expect(500)
			.end(done);
		});

		it("should return 500 for uncaught error",function(done){
			var m1 = function(req,res,next){
				throw new Error("boom!");
			};
			app.use(m1);
			request(app)
			.get("/")
			.expect(500)
			.end(done);
		});

		it('should skip error handlers when next is called without an error', function (done) {
			var m1 = function (req, res, next) {
				next();
			}

			var e1 = function (err, req, res, next) {
				res.end('m1');
			}

			var m2 = function (req, res,next) {
				res.end('m2');
			};

			app.use(m1);
			app.use(e1);
			app.use(m2);

			request(app)
			.get('/')
			.expect('m2')
			.end(done);
		});

		it('should skip normal middlewares if next is called with an error',function(done){
			var m1 = function(req,res,next) {
  				next(new Error("boom!"));
			}

			var m2 = function(req,res,next) {
  				res.end("m2");
			}

			var e1 = function(err,req,res,next) {
  				res.end("e1");
			}

			app.use(m1);
			app.use(m2); // should skip this. will timeout if called.
			app.use(e1);

			request(app)
			.get("/")
			.expect("e1")
			.end(done);
		});

	});

	describe("App embedding as middleware",function(){
		 var app1,app2;
		 beforeEach(function() {
    		app1 = new express();
    		app2 = new express();
  		});
		it("should pass unhandled request to parent",function(done){
		
			function m2(req,res,next){
				res.end("m2");
			}
			app1.use(app2);
			app1.use(m2);

			request(app1)
			.get("/")
			.expect("m2")
			.end(done);

		});

		it("should pass unhandled error to parent",function(done){

			function m1(req,res,next) {
  				next("m1 error");
			}

			function e1(err,req,res,next) {
  				res.end(err);
			}
			app2.use(m1);
			app1.use(app2);
			app1.use(e1);
			request(app1)
			.get("/")
			.expect("m1 error")
			.end(done);
		});

	});

});

