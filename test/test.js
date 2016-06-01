"use strict";

var Path = require('path');

var fs = require("fs-promise");
//var semver = require('semver');
var BasicInterfaces = require("..");
var assert = require('self-explain').assert;
var assertCatch = require('self-explain').assertCatch;
var assertEql = function(a,b) {
    // el eval() es para que muestre los errores!
    eval(assert(! assert.allDifferences(a,b)));
}

describe("basic-interfaces", function(){
    var basicInterfaces = new BasicInterfaces({verbose:false});
    describe('typed', function(){
        it("accepts boolean values", function(){
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
    describe('plain', function(){
        var plain;
        it("accept ok", function(){
            assert(
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).control({name:'Bob', age:42, isChief:false})
            );
        });
        it("detect bad attr type", function(){
            plain=basicInterfaces.plain({
                name:basicInterfaces.string,
                age:basicInterfaces.number,
                isChief:basicInterfaces.boolean.nullable,
            });
            assertCatch(function(){
                plain.control({name:'Bob', age:'42', isChief:false})
            },/BasicInterfaces has 1 error/);
            assertEql(plain.discrepances,[ 'string value detected in number in property \'age\'' ]);
        });
        it("detect lack mandatory attr type", function(){
            plain=basicInterfaces.plain({
                name:basicInterfaces.string,
                age:basicInterfaces.number.nullable,
                isChief:basicInterfaces.boolean.nullable,
            })
            assertCatch(function(){
                plain.control({name:'Bob', age:12})
            },/BasicInterfaces has 1 error/);
            assertEql(plain.discrepances,[ "lack of mandatory property 'isChief'" ]);
        });
        it.skip("detect extra attr", function(){
            assertCatch(function(){
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).control({name:'Bob', age:42, ischief:true})
            },/BasicInterfaces unexpected property 'ischief'/);
        });
    });
});

