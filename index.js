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
        this.verboseMode = false;
    }
    control(value){ 
        if(!this.isNullable && value==null){
            throw new Error('Error BasicInterfaces null value detected in '+this.description);
        }
        return true;
    }
    verbose(yesNo) {
        this.verboseMode = yesNo;
    }
    get nullable(){
        this.isNullable=true;
        return this;
    }
    get description(){
        return 'not nullable';
    }
    discrepances(options) {
        this.discrepances = [];
        var properties = Object.keys(this.definition);
        for(var o in options) {
            if(! (o in this.definition)) {
                this.discrepances.push("unexpected property '"+o+"'")
            } else {
                properties.splice(properties.indexOf(o), 1);
                var def=this.definition[o];
                var check=options[o];
                if(typeof check != def.description) {
                    this.discrepances.push((typeof check)+" value detected in "+def.description+" in property '"+o+"'");
                    //throw new Error("BasicInterfaces "+(typeof check)+" value detected in "+def.description+" in property '"+o+"'")
                }
            }
        }
        for(var p=0; p<properties.length; ++p) {
            this.discrepances.push("lack of mandatory property '"+properties[0]+"'");
        }
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

BasicInterfaces = function(opts){
    this.opts = opts;
};

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
        this.discrepances(options);
        if(this.discrepances.length) {
            if(this.verboseMode) { console.log(this.discrepances); }
            throw new Error('BasicInterfaces has '+this.discrepances.length+' error'+(this.discrepances.length==1?'':'s'));
        }
        return true;
    }
}

BasicInterfaces.prototype.plain = function plain(definition){
    var pbi = new PlainBasicInterface(definition);
    pbi.verbose(this.opts.verbose);
    return pbi;
};


module.exports = BasicInterfaces;
