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
    }
    control(value) {
        console.log("value", value, super.control(value) && (value === true || value===false))
        return super.control(value) && (value === true || value===false);
    }
    get nullable() {
        this.isNullable=false;
        return this;
    }
}

BasicInterfaces = function(){
    this.tbiBoolean = new BooleanTBI();
};

BasicInterfaces.prototype.boolean = function boolean(value) {
    return this.tbiBoolean.control(value);
};

module.exports = BasicInterfaces;
