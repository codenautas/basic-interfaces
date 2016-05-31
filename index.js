"use strict";
/*jshint eqnull:true */
/*jshint node:true */
/*eslint-disable no-console */

var BasicInterfaces = {};

class BasicInterface {
    constructor() {
        if(new.target === BasicInterface) {
            throw new TypeError("Cannot construct BasicInterface instances directly");
        }
    }
    control(value){ 
        if(!this.isNullable && value==null){
            throw new Error('Error BasicInterface not nullable');
        }
        return true;
    }
    get nullable(){
        this.isNullable=true;
        return this;
    }
}

class TypedBasicInterface extends BasicInterface {
    constructor(typeName) {
        if(new.target === BasicInterface) {
            throw new TypeError("Cannot construct TypedBasicInterface instances directly");
        }
        super();
        this.typeName = typeName;
    }
}

class BooleanTBI extends TypedBasicInterface {
    constructor() {
        super('Boolean');
        this.isNullable=false;
    }
    control(value) {
        //console.log("value", value)
        if(value == null) {
            throw new Error("BasicInterfaces null value detected in boolean");
        }
        if(value !== true && value!==false) {
            throw new Error("BasicInterfaces non boolean value");
        }
        return true;
    }
    get nullable() {
        this.isNullable=false;
        return this;
    }
}

BasicInterfaces = function(){};

BasicInterfaces.prototype.boolean = function boolean(value) {
    var r = new BooleanTBI();
    return r.control(value);
};

module.exports = BasicInterfaces;
