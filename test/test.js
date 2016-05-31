"use strict";

var Path = require('path');

var expect = require("expect.js");
var fs = require("fs-promise");
//var semver = require('semver');
var BasicInterfaces = require("..");
var assert = require('self-explain').assert;
var assertCatch = require('self-explain').assertCatch;

describe("basic-interfaces", function(){
    var basicInterfaces = new BasicInterfaces();
    it.skip("accepts boolean values", function(){
        assert(basicInterfaces.boolean.control(true));
        assert(basicInterfaces.boolean.control(false));
        assert(basicInterfaces.boolean.nullable.control(null));
    });
    it("detect non boolean",function(){
        assertCatch(function(){
            basicInterfaces.boolean.control("ufs");
        },/BasicInterfaces non boolean value/);
    })
    it("detect non nullable",function(){
        assertCatch(function(){
            basicInterfaces.boolean.control(null);
        },/BasicInterfaces null value detected in boolean/);
    })
});

