"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var BasicInterfaces = {};

var constructorName = require('best-globals').constructorName;

class BasicInterface {
    constructor() {
        if(this.constructor === BasicInterface) { throw new TypeError("Cannot construct BasicInterface instances directly");  }
        this.enableDebug = true;
    }
    control(value){ 
        var discrepances=this.discrepances(value);
        if(discrepances!==null){
            if(this.enableDebug) { console.log(discrepances); }
            throw new Error('BasicInterfaces discrepances detected '+JSON.stringify(discrepances));
        }
        return true;
    }
    debug(yesNo) {
        this.enableDebug = yesNo;
    }
    discrepances(value){
        var inputName = constructorName(value);
        switch(inputName) {
            case 'Date': case 'Array': case 'RegExp': case 'Function':
                throw new Error('invalid '+inputName+' input');
        }
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

'boolean,string,number,object'.split(',').forEach(function(typeName){
    Object.defineProperty(BasicInterfaces.prototype, typeName,{
        get: function () {
            var tbi = new TypedBasicInterface(typeName);
            tbi.debug(this.opts.debug);
            return tbi;
        }
    });
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
        if(constructorName(definition) !== 'Object') {
            throw new TypeError('definition should be an Object');
        }
    }
    discrepances(obj){
        var self=this;
        var result = super.discrepances(obj);
        if(result){
            return result;
        }
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
}

BasicInterfaces.prototype.plain = function plain(definition){
    var pbi = new PlainBasicInterface(definition);
    pbi.debug(this.opts.debug);
    return pbi;
};

module.exports = BasicInterfaces;
