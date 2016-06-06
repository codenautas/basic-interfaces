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
        var discrepances=this.discrepances(value);
        if(discrepances!==null){
            console.log(discrepances); // mejor que sea opcional
            throw new Error('BasicInterfaces discrepances detected '+JSON.stringify(discrepances));
        }
        return true;
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
        /*
        if(new.target === BasicInterface) {
            throw new TypeError("Cannot construct TypedBasicInterface instances directly");
        }
        */
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

BasicInterfaces = function(){};

'boolean,string,number,object'.split(',').forEach(function(typeName){
    Object.defineProperty(BasicInterfaces.prototype, typeName,{
        get: function () {
            return new TypedBasicInterface(typeName);
        }
    });
});

class PlainBasicInterface extends BasicInterface {
    constructor(definition){
        super();
        this.definition = definition;
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
        var keys=Object.keys(self.definition);
        keys.forEach(function(key){
            if(!self.definition[key].isNullable && !(key in obj)){
                result[key] = "lack mandatory property";
            }
        });
        for(var k in result){
            return result;
        }
        return null;
    }
}

BasicInterfaces.prototype.plain = function plain(definition){
    return new PlainBasicInterface(definition);
};


module.exports = BasicInterfaces;
