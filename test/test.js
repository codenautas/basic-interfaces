"use strict";

var Path = require('path');

var expect = require("expect.js");
var fs = require("fs-promise");
//var semver = require('semver');
var BasicInterfaces = require("..");
var assert = require('self-explain').assert;

describe("basic-interfaces", function(){
    var basicInterfaces = new BasicInterfaces();
    it.skip("accepts boolean values", function(){
        assert(basicInterfaces.boolean(true));
        assert(basicInterfaces.boolean(false));
        assert(basicInterfaces.boolean.nullable(null));
    });
});

