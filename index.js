"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var BasicInterfaces = {};

class BasicInterface {
    constructor() {
        /*
        if(new.target === BasicInterface) {
            throw new TypeError("Cannot construct BasicInterface instances directly");
        }
        */
    }
    control(value){ 
        if(!this.isNullable && value==null){
            throw new Error('Error BasicInterfaces null value detected in '+this.description);
        }
        return true;
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
        /*
        if(new.target === BasicInterface) {
            throw new TypeError("Cannot construct TypedBasicInterface instances directly");
        }
        */
        super();
        this.typeName = typeName;
    }
    control(value) {
        super.control(value);
        if(value != null && typeof value !== this.typeName) {
            throw new Error("BasicInterfaces non "+this.typeName+" value");
        }
        return true;
    }
    get description(){
        return this.typeName;
    }
}

BasicInterfaces = function(){};

'boolean,string,number,object'.split(',').forEach(function(typeName){
    Object.defineProperty(BasicInterfaces.prototype, typeName,{
        get: function () {
            return new TypedBasicInterface(typeName);
        }
    });
});

class PlainBasicInterface extends BasicInterface {
}

BasicInterfaces.prototype.plain = function plain(definition){
    return new PlainBasicInterface(definition);
};


module.exports = BasicInterfaces;
