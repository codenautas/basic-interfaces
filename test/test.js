"use strict";

var Path = require('path');

var fs = require("fs-promise");
var sinon = require('sinon');
var BasicInterfaces = require("..");
var assert = require('self-explain').assert;
var differences = assert.allDifferences;
var assertCatch = require('self-explain').assertCatch;
var sinon = require('sinon');

/*

AGREGAR tests:
    Ej assert catch bi.boolean.control (1)
*/

describe("basic-interfaces", function(){
    var basicInterfaces = new BasicInterfaces({debug:false});
    describe('typed', function(){
        it("accepts boolean values", function(){
            eval(assert(!differences(basicInterfaces.boolean.discrepances(true),null)));
            eval(assert(!differences(basicInterfaces.boolean.discrepances(false),null)));
            eval(assert(!differences(basicInterfaces.boolean.nullable.discrepances(null),null)));
        });
        it("detect non boolean",function(){
            eval(assert(!differences(basicInterfaces.boolean.discrepances("ufs"), 'string value in boolean')));
        });
        it("detect non nullable",function(){
            eval(assert(!differences(basicInterfaces.boolean.discrepances(null),'null value detected in boolean')));
        });
        it("control ok",function(){
            eval(assert( basicInterfaces.boolean.control(true) ));
            eval(assert( basicInterfaces.string.control("str") ));
            eval(assert( basicInterfaces.number.control(12) ));
            eval(assert( basicInterfaces.number.control(0.12) ));
            eval(assert( basicInterfaces.object.control({one:1, two:2}) ));
            eval(assert( basicInterfaces.date.control(new Date()) ));
        });
        describe('input errors', function(){
            [
                {type:'boolean', bad:1},
                {type:'string',  bad:2},
                {type:'number',  bad:'str'},
                {type:'object',  bad:3},
                {type:'date',  bad:'nop'},
                {type:'date',  bad:new Date('nop')},
            ].forEach(function(ctrl) {
                it(ctrl.type+'.control('+ctrl.bad+')', function() {
                   assertCatch(function() {
                       var obj = basicInterfaces[ctrl.type];
                       obj.control(ctrl.bad);
                   }, /BasicInterfaces discrepances detected/);
                });
            });
        });
    });
    describe('plain', function(){
        var plainDef = {
            name:basicInterfaces.string,
            age:basicInterfaces.number,
            isChief:basicInterfaces.boolean.nullable,
        };
        it("accept ok", function(){
            eval(assert(
                basicInterfaces.plain(plainDef).discrepances({name:'Bob', age:42}) === null 
            ));
        });
        it("detect bad attr type", function(){
            eval(assert(!differences(
                basicInterfaces.plain(plainDef).discrepances({name:'Bob', age:'42', isChief:false}),
                {age:"string value in number"}
            )));
        });
        it("detect lack mandatory attr type", function(){
            eval(assert(!differences(
                basicInterfaces.plain(plainDef).discrepances({name:'Bob'}),
                {age:'lack mandatory property'}
            )));
        });
        it("detect extra attr", function(){
            eval(assert(!differences(
                basicInterfaces.plain(plainDef).discrepances({name:'Bob', age:42, ischief:true}),
                {ischief:'unexpected property'}
            )));
        });
        it("various detects", function(){
            eval(assert(!differences(
                basicInterfaces.plain(plainDef).discrepances({names:'Tom & Bob', age:'42'}),
                {
                    names:'unexpected property',
                    age:"string value in number",
                    name:'lack mandatory property'
                }
            )));
        });
        describe("input errors", function(){
            var plain = basicInterfaces.plain({name:basicInterfaces.string});
            [ [],"string",3,3.4 ].forEach(function(err) {
                it("plain.discrepances("+JSON.stringify(err)+')',function(){
                    assertCatch(function() { plain.discrepances(err); }, /definition should be an Object/);
                });
            });
            [null, undefined].forEach(function(badInput) {
                it('constructor should reject '+JSON.stringify(badInput)+' definition', function() {
                    assertCatch(function() {
                        basicInterfaces.plain(badInput);
                    }, /invalid definition/);
                }); 
            });
            it("control()", function(){
                assertCatch(function() {
                    basicInterfaces.plain(plainDef).control(/*undefined*/);
                }, /BasicInterfaces discrepances detected/); 
            });
            it("constructor(definition)", function(){
                assertCatch(function() {
                    basicInterfaces.plain([]);
                }, /definition should be an Object/); 
            });
        });
    });
    describe('array', function(){
        var arrayDef = [
            basicInterfaces.string,
            basicInterfaces.number,
            basicInterfaces.date.nullable,
            basicInterfaces.boolean.nullable,
        ];
        it("accept ok", function(){
            eval(assert(
                basicInterfaces.array(arrayDef).discrepances(['Bob', 42]) === null 
            ));
        });
        it("detect missing parameters", function(){
            eval(assert(
                !differences(
                    basicInterfaces.array(arrayDef).discrepances(['Bob']),
                    {1:'lack mandatory property'}
                )
            ));
        });
        it("detect exceeding parameters", function(){
            eval(assert(
                !differences(
                    basicInterfaces.array(arrayDef).discrepances(['Bob',122,new Date(),true,'John', 'Paul']),
                    {
                        4:'unexpected property',
                        5:'unexpected property',
                    }
                )
            ));
        });
        it("detect bad parameter type", function(){
            eval(assert(
                !differences(
                    basicInterfaces.array(arrayDef).discrepances(['Bob', '42', false]),
                    {1: 'string value in number',
                     2: 'boolean value in date'}
                )
            ));
        });
        it("various detects", function(){
            eval(assert(
                !differences(
                    basicInterfaces.array(arrayDef).discrepances([1000, 'Tom & Bob', 9]),
                    {
                        0: 'number value in string', 
                        1: 'string value in number', 
                        2: 'number value in date'
                    }
                )
            ));
        });
        describe("input errors", function(){
            var arr = basicInterfaces.array([basicInterfaces.string]);
            [ {},"string",3,3.4 ].forEach(function(err) {
                it("array.discrepances("+JSON.stringify(err)+')',function(){
                    assertCatch(function() { arr.discrepances(err); }, /definition should be an Array/);
                });
            });
            [null, undefined].forEach(function(badInput) {
                it('constructor should reject '+JSON.stringify(badInput)+' definition', function() {
                    assertCatch(function() {
                        basicInterfaces.array(badInput);
                    }, /invalid definition/);
                }); 
            });
            it("control()", function(){
                assertCatch(function() {
                    basicInterfaces.array(arrayDef).control(/*undefined*/);
                }, /BasicInterfaces discrepances detected/); 
            });
            it("constructor(definition)", function(){
                assertCatch(function() {
                    basicInterfaces.array({});
                }, /definition should be an Array/); 
            });
        });
    });
    describe('coverage', function(){
        it('default options', function() {
           sinon.stub(console, 'log', function() {});
           assertCatch(function() {
               var bi = new BasicInterfaces();
               bi.string.control(1);
           },/BasicInterfaces discrepances detected/);
           console.log.restore();
        });
    });
});

