/* jshint elision:true */
var
  expect = require("expect.js"),
  i = require("../icepick");

describe("icepick", function () {
  "use strict";

  describe("freeze", function () {
    it("should work", function () {
      var a = i.freeze({asdf: "foo", zxcv: {asdf: "bar"}});

      expect(a.asdf).to.equal("foo");
      expect(Object.isFrozen(a)).to.equal(true);

      expect(function () {
        a.asdf = "bar";
      }).to.throwError();

      expect(function () {
        a.zxcv.asdf = "qux";
      }).to.throwError();

      expect(function () {
        a.qwer = "bar";
      }).to.throwError();
    });

    it("should not work with cyclical objects", function () {
      var a = {};
      a.a = a;

      expect(i.freeze).withArgs(a).to.throwError();

      a = {b: {}};
      a.b.a = a;
      expect(i.freeze).withArgs(a).to.throwError();
    });

  });

  describe("assoc", function () {
    it("should work with objects", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
        result = i.assoc(o, "b", 4);

      expect(result).to.eql({a: 1, b: 4, c: 3});

      result = i.assoc(o, "d", 4);
      expect(result).to.eql({a: 1, b: 2, c: 3, d: 4});
    });

    it("should freeze objects you assoc", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
        result = i.assoc(o, "b", {d: 5});

      expect(result).to.eql({a: 1, b: {d: 5}, c: 3});

      expect(Object.isFrozen(result.b)).to.be.ok();
    });

    it("should work with arrays", function () {
      var a = i.freeze([1, 2, 3]),
        result = i.assoc(a, 1, 4);

      expect(result).to.eql([1, 4, 3]);

      result = i.assoc(a, "1", 4);
      expect(result).to.eql([1, 4, 3]);

      result = i.assoc(a, 3, 4);
      expect(result).to.eql([1, 2, 3, 4]);
    });

    it("should freeze arrays you assoc", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
        result = i.assoc(o, "b", [1, 2]);

      expect(result).to.eql({a: 1, b: [1, 2], c: 3});

      expect(Object.isFrozen(result.b)).to.be.ok();
    });

    it("should return a frozen copy", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
        result = i.assoc(o, "b", 4);

      expect(result).to.not.equal(o);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("should not modify child objects", function () {
      var o = i.freeze({a: 1, b: 2, c: {a: 4}}),
        result = i.assoc(o, "b", 4);

      expect(result.c).to.equal(o.c);
    });
  });

  describe("dissoc", function () {
    it("should work with objecs", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
        result = i.dissoc(o, "b");

      expect(result).to.eql({a:1, c:3});
    });

    it("should work with arrays (poorly)", function () {
      var a = i.freeze([1, 2, 3]),
        result = i.dissoc(a, 1);

      expect(result).to.eql([1, , 3]);
    });
  });

  describe("assocIn", function () {
    it("should work recursively", function () {
      var o = i.freeze({a: 1, b: 2, c: {a: 4}}),
        result = i.assocIn(o, ["c", "a"], 5);

      expect(result).to.eql({a: 1, b: 2, c: {a: 5}});
    });

    it("should work recursively (deeper)", function () {
      var o = i.freeze({
          a: 1,
          b: {a: 2},
          c: [
            {
              a: 3,
              b: 4
            },
            {a: 4}
          ]
        }),
        result = i.assocIn(o, ["c", 0, "a"], 8);

      expect(result.c[0].a).to.equal(8);
      expect(result).to.not.equal(o);
      expect(result.b).to.equal(o.b);
      expect(result.c).to.not.equal(o.c);
      expect(result.c[0]).to.not.equal(o.c[0]);
      expect(result.c[0].b).to.equal(o.c[0].b);
      expect(result.c[1]).to.equal(o.c[1]);
    });
  });

  describe("getIn", function () {
    it("should work", function () {
      var o = i.freeze({
          a: 1,
          b: {a: 2},
          c: [
            {a: 3, b: 4},
            {a: 4}
          ]
        });
      expect(i.getIn(o, ["c", 0, "b"])).to.equal(4);
    });

    it("should work without a path", function () {
      var o = i.freeze({a: {b: 1}});
      expect(i.getIn(o)).to.equal(o);
    });
  });

  describe("updateIn", function () {
    it("should work", function () {
      var o = i.freeze({a: 1, b: 2, c: {a: 4}}),
        result = i.updateIn(o, ["c", "a"], function (num) {
          return num * 2;
        });

      expect(result).to.eql({a: 1, b: 2, c: {a: 8}});

    });
  });

  describe("Array methods", function () {
    it("push", function () {
      var a = i.freeze([1, 2]),
        result = i.push(a, 3);

      expect(result).to.eql([1, 2, 3]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("unshift", function () {
      var a = i.freeze([1, 2]),
        result = i.unshift(a, 3);

      expect(result).to.eql([3, 1, 2]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("pop", function () {
      var a = i.freeze([1, 2]),
        result = i.pop(a);

      expect(result).to.eql([1]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("shift", function () {
      var a = i.freeze([1, 2]),
        result = i.shift(a);

      expect(result).to.eql([2]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("reverse", function () {
      var a = i.freeze([1, 2, 3]),
        result = i.reverse(a);

      expect(result).to.eql([3, 2, 1]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("sort", function () {
      var a = i.freeze([4, 1, 2, 3]),
        result = i.sort(a);

      expect(result).to.eql([1, 2, 3, 4]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("splice", function () {
      var a = i.freeze([1, 2, 3]),
        result = i.splice(a, 1, 1, 4);

      expect(result).to.eql([1, 4, 3]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("slice", function () {
      var a = i.freeze([1, 2, 3]),
        result = i.slice(a, 1, 2);

      expect(result).to.eql([2]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("map", function () {
      var a = i.freeze([1, 2, 3]);
      var result = i.map(function (v) { return v * 2; }, a);

      expect(result).to.eql([2, 4, 6]);
      expect(Object.isFrozen(result)).to.be.ok();
    });

    it("filter", function () {
      var a = i.freeze([1, 2, 3]);
      var result = i.filter(function (v) { return v % 2; }, a);

      expect(result).to.eql([1, 3]);
      expect(Object.isFrozen(result)).to.be.ok();
    });
  });


  describe("assign", function () {

    it("should work", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
      result = i.assign(o, {"b": 3, "c": 4});
      expect(result).to.eql({a: 1, b: 3, c: 4});
      expect(result).to.not.equal(o);
      result = i.assign(o, {"d": 4});
      expect(result).to.eql({a: 1, b: 2, c: 3, d: 4});
    });

    it("should work with multiple args", function () {
      var o = i.freeze({a: 1, b: 2, c: 3}),
      result = i.assign(o, {"b": 3, "c": 4}, {"d": 4});
      expect(result).to.eql({a: 1, b: 3, c: 4, d: 4});
    });

  });

  describe("merge", function () {

    it("should merge nested objects", function () {
      var o1 = i.freeze({a: 1, b: {c: 1, d: 1}});
      var o2 = i.freeze({a: 1, b: {c: 2}, e: 2});

      var result = i.merge(o1, o2);
      expect(result).to.eql({a: 1, b: {c: 2, d: 1}, e: 2});
    });

    it("should replace arrays", function () {
      var o1 = i.freeze({a: 1, b: {c: [1, 1]}, d: 1});
      var o2 = i.freeze({a: 2, b: {c: [2]}});

      var result = i.merge(o1, o2);
      expect(result).to.eql({a: 2, b: {c: [2]}, d: 1});
    });

    it("should overwrite with nulls", function () {
      var o1 = i.freeze({a: 1, b: {c: [1, 1]}});
      var o2 = i.freeze({a: 2, b: {c: null}});

      var result = i.merge(o1, o2);
      expect(result).to.eql({a: 2, b: {c: null}});
    });

    it("should overwrite primitives with objects", function () {
      var o1 = i.freeze({a: 1, b: 1});
      var o2 = i.freeze({a: 2, b: {c: 2}});

      var result = i.merge(o1, o2);
      expect(result).to.eql({a: 2, b: {c: 2}});
    });

    it("should overwrite objects with primitives", function () {
      var o1 = i.freeze({a: 1, b: {c: 2}});
      var o2 = i.freeze({a: 1, b: 2});

      var result = i.merge(o1, o2);
      expect(result).to.eql({a: 1, b: 2});
    });

    it("should keep references the same if nothing changes", function () {
      var o1 = i.freeze({a: 1, b: {c: 1, d: 1, e: [1]}});
      var o2 = i.freeze({a: 1, b: {c: 1, d: 1, e: o1.b.e}});
      var result = i.merge(o1, o2);
      expect(result).to.equal(o1);
      expect(result.b).to.equal(o1.b);
    });

    it("should handle undefined parameters", function () {
      expect(i.merge({}, undefined)).to.eql({});
      expect(i.merge(undefined, {})).to.eql(undefined);
    });

  });

});


describe("internals", function () {
  describe("_weCareAbout", function () {
    it("should care about objects", function () {
      expect(i._weCareAbout({})).to.equal(true);
    });
    it("should care about arrays", function () {
      expect(i._weCareAbout([])).to.equal(true);
    });
    it("should not care about dates", function () {
      expect(i._weCareAbout(new Date())).to.equal(false);
    });
    it("should not care about null", function () {
      expect(i._weCareAbout(null)).to.equal(false);
    });
    it("should not care about undefined", function () {
      expect(i._weCareAbout(null)).to.equal(false);
    });
  });

  describe("_slice", function () {
    it("should work", function () {
      expect(i._slice([1, 2, 3], 2)).to.eql([3]);
      expect(i._slice([1, 2, 3], 1)).to.eql([2, 3]);
      expect(i._slice([1, 2, 3], 0)).to.eql([1, 2, 3]);
      expect(i._slice([1, 2, 3], 4)).to.eql([]);
      expect(i._slice([], 0)).to.eql([]);
      expect(i._slice([], 1)).to.eql([]);
    });
  });
});
