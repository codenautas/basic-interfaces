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
        assert(basicInterfaces.boolean(true));
        assert(basicInterfaces.boolean(false));
        assert(basicInterfaces.boolean.nullable(null));
    });
    it.skip("detect non boolean",function(){
        assertCatch(function(){
            basicInterfaces.boolean("ufs")
        },/BasicInterfaces non boolean value/);
    })
    it.skip("detect non nullable",function(){
        assertCatch(function(){
            basicInterfaces.boolean(null)
        },/BasicInterfaces null value detected in boolean/);
    })
});

