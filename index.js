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
    constructor(definition) {
        super();
        if(typeof definition !== 'object') {
            throw new Error('BasicInterfaces constructor expects an object');
        }
        this.definition = definition;
    }
    control(options) {
        var properties = Object.keys(this.definition);
        for(var o in options) {
            if(! (o in this.definition)) {
                throw new Error("BasicInterfaces unexpected property '"+o+"'");
            }
            var def=this.definition[o];
            var check=options[o];
            if(typeof check != def.description) {
                throw new Error("BasicInterfaces "+(typeof check)+" value detected in "+def.description+" in property '"+o+"'")
            }
            properties.splice(properties.indexOf(o), 1);
        }
        if(properties.length) {
            // it will fail with the first one
            throw new Error("BasicInterfaces lack of mandatory property '"+properties[0]+"'")
        }
        return true;
    }
}

BasicInterfaces.prototype.plain = function plain(definition){
    return new PlainBasicInterface(definition);
};


module.exports = BasicInterfaces;
