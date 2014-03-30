//Cache.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
function Cache(descr){
    for(var prop in descr){
	this[prop] =  descr[prop];
    }
    this._cache = {};
    if(this.enabled === undefined)
	this.enabled = true;
}



Cache.prototype.get = function(key,subkey){
    if(!this.enabled) return undefined;
    var c = this._cache[key];
    if(subkey){
	if(c) return c[subkey];
    }
    return c;
};

Cache.prototype.put = function(key,subkeyorvalue,value){
   if(!this.enabled) return;
   if(value === undefined){
       this._cache[key] = subkeyorvalue;
       console.log("Added " + key + " to cache.");
   } else {
       if(this._cache[key] === undefined){
	   this._cache[key] = {};
       }
       this._cache[key][subkeyorvalue] = value;
       console.log("Added " + key + "." + subkeyorvalue + " to cache.");
   }
};
Cache.prototype.getColor = function(model,color){
   if(!this.enabled) return;
    return this._cache[model][color];
};


Cache.prototype.has = function(key,subkey){
    if(!this.enabled) return false;
     if(this._cache[key] === undefined)
	 return false;
    
    if(subkey !== undefined){
	return this._cache[key][subkey] !== undefined;
    } 
    return true;
};

Cache.prototype.update = function(key,descr){
    for(var prop in descr){
	this._cache[key][prop] =  descr[prop];
    }
};

Cache.prototype.putColor = function(model,color,buffer){
   if(!this.enabled) return;
    console.log("Added " + model + "." + color + " to cache.");
    this._cache[model][color] = buffer;
};

Cache.prototype.hasColor = function(model,color){
    if(!this.enabled) return false;
     if(this._cache[model] === undefined)
	 return false;
    return this._cache[model][color] !== undefined;
};
