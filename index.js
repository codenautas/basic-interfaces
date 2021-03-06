"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var BasicInterfaces = {};

var bestGlobals = require('best-globals');
var constructorName = bestGlobals.constructorName;

class BasicInterface {
    constructor() {
        if(this.constructor === BasicInterface) { throw new TypeError("Cannot construct BasicInterface instances directly");  }
        this.enableDebug = true;
    }
    control(value){
        var discrepances=this.discrepances(value);
        if(discrepances!==null){
            if(this.enableDebug) {
                console.log(discrepances);
            }
            throw new Error('BasicInterfaces discrepances detected '+JSON.stringify(discrepances));
        }
        return true;
    }
    debug(yesNo) {
        this.enableDebug = yesNo;
    }
    discrepances(value){
        if(!this.isNullable && value==null){
            return 'null value detected in '+this.description;
        }
        return null;
    }
    get nullable(){
        this.isNullable=true;
        return this;
    }
    get description(){
        return 'not nullable';
    }
}

class TypedBasicInterface extends BasicInterface {
    constructor(typeName) {
        super();
        this.typeName = typeName;
    }
    discrepances(value) {
        return super.discrepances(value) || (
            value != null && typeof value !== this.typeName ? typeof value +" value in "+this.typeName : null
        );
    }
    get description(){
        return this.typeName;
    }
}

BasicInterfaces = function BasicInterface(opts){
    this.opts = opts || {};
    if(! ('debug' in this.opts)) {
        this.opts.debug = true;
    }
};

BasicInterfaces.prototype.init = function init(obj){
    obj.debug(this.opts.debug);
    return obj;
};

'boolean,string,number,object'.split(',').forEach(function(typeName){
    Object.defineProperty(BasicInterfaces.prototype, typeName,{
        get: function () {
            return this.init(new TypedBasicInterface(typeName));
        }
    });
});

class DateInterface extends BasicInterface {
    constructor() {
        super();
    }
    discrepances(value) {
        return super.discrepances(value) || (
            (value != null && ! bestGlobals.date.isOK(value)) ? typeof value+ " value in " +this.description : null
        );
    }
    get description(){
        return 'date';
    }
}

Object.defineProperty(BasicInterfaces.prototype, 'date',{
    get: function () {
        return this.init(new DateInterface());
    }
});

class ParametrizedInterface extends BasicInterface {
    constructor(definition){
        super();
        if(this.constructor === ParametrizedInterface) {
            throw new TypeError("Cannot construct ParametrizedInterface instances directly");
        }
        if(definition==null) {
            throw new Error('invalid definition');
        }
        this.definition = definition;
    }
}

class PlainBasicInterface extends ParametrizedInterface {
    constructor(definition){
        super(definition);
        this.checkInputClass(definition);
    }
    discrepances(obj){
        var self=this;
        var result = super.discrepances(obj);
        if(result){
            return result;
        }
        this.checkInputClass(obj);
        result = {};
        var keys=Object.keys(obj);
        keys.forEach(function(key){
            if(key in self.definition){
                var localResult = self.definition[key].discrepances(obj[key]);
                if(localResult != null){
                    result[key] = localResult;
                }
            }else{
                result[key] = "unexpected property";
            }
        });
        keys=Object.keys(self.definition);
        keys.forEach(function(key){
            if(!self.definition[key].isNullable && !(key in obj)){
                result[key] = "lack mandatory property";
            }
        });
        if(Object.keys(result).length) { return result; }
        return null;
    }
    checkInputClass(input) {
        if(constructorName(input) !== 'Object') {
            throw new TypeError('definition should be an Object');
        }
    }
}

BasicInterfaces.prototype.plain = function plain(definition){
    return this.init(new PlainBasicInterface(definition));
};

class ArrayBasicInterface extends PlainBasicInterface {
    constructor(definition){
        super(definition);
        this.checkInputClass(definition);
    }
    checkInputClass(input) {
        if(constructorName(input) !== 'Array') {
            throw new TypeError('definition should be an Array');
        }
    }
}

BasicInterfaces.prototype.array = function array(definition){
    return this.init(new ArrayBasicInterface(definition));
};

module.exports = BasicInterfaces;
