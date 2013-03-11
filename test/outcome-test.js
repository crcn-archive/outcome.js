var EventEmitter = require("events").EventEmitter,
outcome = require("../"),
expect = require("expect.js");

describe("outcome", function() {
  var em = new EventEmitter();

  it("can re-route an error", function(done) {
    outcome.e(function() {
      done()
    }).s(function() {
      done(new Error("didn't re-route properly"));
    })(new Error("fail!"));
  });

  it("can throw a global error if failed", function(done) {
    outcome.once("unhandledError", function(err) {
      done();
    });

    outcome.s(function() {
      done("fail!");
    })(new Error("fail!"));
  });

  it("can re-route an error to an event emitter", function(done) {
    em.once("error", function(err) {
      done();
    });

    outcome.e(em).s(function() {
      done(new Error("fail"));
    })(new Error("fail!"))
  });


  it("can wrap around an emitter and call multiple callbacks", function() {

    var calls = 0, cb;

    var o = outcome.e(em);
    em.on("error", cb = function(err) {
      calls++;
    });


    o.s(function(){})(new Error("fail"));
    expect(calls).to.be(1);

    o.e(function(){}).s(function(){})(new Error("fail"));
    expect(calls).to.be(1);


    //sanity
    o.s(function(){})(new Error("fail"));
    expect(calls).to.be(2);

    //ignore undefined
    o.e(undefined).s(function(){})(new Error("fail"));


    em.removeListener("error", cb);
  });
});