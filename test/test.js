"use strict";

var Path = require('path');

var fs = require("fs-promise");
//var semver = require('semver');
var BasicInterfaces = require("..");
var assert = require('self-explain').assert;
var differences = assert.allDifferences;
var assertCatch = require('self-explain').assertCatch;

describe("basic-interfaces", function(){
    var basicInterfaces = new BasicInterfaces();
    describe('typed', function(){
        it("accepts boolean values", function(){
            eval(assert(!differences(basicInterfaces.boolean.discrepances(true),null)));
            eval(assert(!differences(basicInterfaces.boolean.discrepances(false),null)));
            eval(assert(!differences(basicInterfaces.boolean.nullable.discrepances(null),null)));
        });
        it("detect non boolean",function(){
            eval(assert(!differences(basicInterfaces.boolean.discrepances("ufs"), 'string value in boolean')));
        })
        it("detect non nullable",function(){
            eval(assert(!differences(basicInterfaces.boolean.discrepances(null),'null value detected in boolean')));
        })
    });
    describe('plain', function(){
        it("accept ok", function(){
            eval(assert(
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).discrepances({name:'Bob', age:42}) === null 
            ));
        });
        it("detect bad attr type", function(){
            eval(assert(!differences(
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).discrepances({name:'Bob', age:'42', isChief:false}),
                {age:"string value in number"}
            )));
        });
        it("detect lack mandatory attr type", function(){
            eval(assert(!differences(
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).discrepances({name:'Bob'}),
                {age:'lack mandatory property'}
            )));
        });
        it("detect extra attr", function(){
            eval(assert(!differences(
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).discrepances({name:'Bob', age:42, ischief:true}),
                {ischief:'unexpected property'}
            )));
        });
        it("various detects", function(){
            eval(assert(!differences(
                basicInterfaces.plain({
                    name:basicInterfaces.string,
                    age:basicInterfaces.number,
                    isChief:basicInterfaces.boolean.nullable,
                }).discrepances({names:'Tom & Bob', age:'42'}),
                {
                    names:'unexpected property',
                    age:"string value in number",
                    name:'lack mandatory property'
                }
            )));
        });
    });
    describe('input errors', function(){
        var inputs = [
            {param:[], expected:'Array'},
            {param:new Date(), expected:'Date'},
            {param:new RegExp("dummy"), expected:'RegExp'},
        ];
        'boolean,string,number,object'.split(',').forEach(function(typeName) {
            inputs.forEach(function(input) {
                it(typeName+".discrepances("+input.expected+')',function(){
                    var err = new RegExp('invalid '+input.expected+' input');
                    assertCatch(function() {
                        var obj = basicInterfaces[typeName];
                        obj.discrepances(input.param);
                    }, err);
                });
            });
        })
    });
});

