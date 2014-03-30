//Model.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
//var cacheEnabled = false;
var cacheEnabled = true;
var cache = new Cache({"enabled":cacheEnabled});
function Model(descr){
    this.setup(descr);
    this.type = "Model";
}

Model.prototype.setup = function(descr){
    if(typeof(descr) === "string"){
	var name = descr;
	this.modelName = name;
	if(cache.has(name)){
	    descr = cache.get(name);
	} else {
	    descr = plyReader.getData(name);
	    descr.modelName = name;
	    cache.put(name,descr);
	}
    }
    for(var prop in descr){
	this[prop] =  descr[prop];
    }
    this.loc = this.loc || [0.0,0.0,0.0,1.0]; 
    this.objMatr = this.objMatr ||  mat4.identity(mat4.create());
    this.translate(this.loc);
    this.init();
    this.glInitialized = false;
    this.colorsNeedUpdate = true;
};

Model.prototype.glInit = function(gl){
    if(!this.vBuffer){
	if(cache.has(this.modelName,"vBuffer")){
	    this.vBuffer = cache.get(this.modelName,"vBuffer");
	} else {
	    this.vBuffer =gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points),
			   gl.STATIC_DRAW );
	   cache.put(this.modelName,"vBuffer",this.vBuffer);
	}
    }

    if(!this.nBuffer){
	if(cache.has(this.modelName,"nBuffer")){
	    this.nBuffer = cache.get(this.modelName,"nBuffer");
	} else {
	    this.nBuffer =gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.normals),
			   gl.STATIC_DRAW );
	   cache.put(this.modelName,"nBuffer",this.nBuffer);
	}
    }

    if(!this.cBuffer){
	if(cache.hasColor(this.modelName,colorToName(this.color))){
	    this.cBuffer = cache.getColor(this.modelName,colorToName(this.color));
	} else {
	    this.cBuffer = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, this.flatColors, gl.STATIC_DRAW );
	   cache.putColor(this.modelName,colorToName(this.color),this.cBuffer);
	}
    }
    
    if(!this.tBuffer){
	if(cache.has(this.modelName,"tBuffer")){
	    this.tBuffer = cache.get(this.modelName,"tBuffer");
	} else {
	    this.texCoords = [[0,0],[0,1],[1,1],[1,0]] || this.texCoords;
	    this.texCoordsArray = [];
	    //A shoddy hack
	    var texs =    [ 0, 1, 2, 0, 2, 3 ];
	    //for(var i = 0; i < this.polys.length; ++i){
	    for(var i = 0; i < this.points.length; ++i){
		//var p = this.polys[i];
		//var indices = [p[0], p[1], p[2], p[0], p[2], p[3]];
		//for ( var j = 0; j < indices.length; ++j ) {
		    this.texCoordsArray.push(this.texCoords[texs[i%6]]);
	    }
	    this.tBuffer = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.texCoordsArray),
			   gl.STATIC_DRAW );
	   cache.put(this.modelName,"tBuffer",this.tBuffer);
	}
    }

    this.colorsNeedUpdate = false;

    if(this.textureSrc){
	this.initTexture(gl);
    }

    this.glInitialized = true;
};



Model.prototype.initTexture = function(gl){
        if(!cache.has(this.textureSrc)){
	    this.texture = gl.createTexture();
	    cache.put(this.textureSrc,this.texture);
	    this.image = new Image();
	    var cbe = this;
	    this.image.onload = function() {
		console.log("loaded " + cbe.textureSrc);
		cbe.configureTexture(gl);
	    };
	    this.image.src = this.textureSrc;
	} else {
	   this.texture = cache.get(this.textureSrc); 
	}
};

Model.prototype.configureTexture = function(gl){
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, null);
};

Model.prototype.init = function (){
    var  brightGreen = [0.0,1.0,0.0,1.0];
    this.setColor(this.color || brightGreen);
};


Model.prototype.updateObjM = function(funcMatr){
    var obm = mat4.multiply(funcMatr,this.objMatr,mat4.create());
    this.objMatr = obm;
};

Model.prototype.translate = function(t){
    if(t.length == 3){
	t[3] = 0;
    }
    vec4.add(this.loc,t,this.loc);
    this.loc[3] = 1;
    var funcMatr = mat4.translate(mat4.identity(mat4.create()),t);
    this.updateObjM(funcMatr);
};

Model.prototype.scale= function(s){
    var loc = this.loc.slice(0);
    this.translate(vec4.negate(loc,vec4.create()));
    var funcMatr = mat4.scale(mat4.identity(mat4.create()),s);
    this.updateObjM(funcMatr);
    this.translate(loc);
};

Model.prototype.rotate= function(angle,axis){
    var loc = this.loc.slice(0);
    this.translate(vec4.negate(loc,vec4.create()));
    var funcMatr = mat4.rotate(mat4.identity(mat4.create()),angle,axis);
    this.updateObjM(funcMatr);
    this.translate(loc);
    //this.loc = mat4.multiplyVec4(funcMatr,this.loc);
};

//Returns a copy of this model, while referring to the same
//Points, normals and pols
Model.prototype.modelCopy = function() {
    var m = this.getData();
    /* TURN OFF IF CHANGIN THESE PARAMETERS IN NEW MODEL */
    return new Model(m);
};

Model.prototype.getData = function(){
    var m =  {"points": this.points,
	      "normals": this.normals,
	      "polys": this.pols,
	      "textureSrc": this.textureSrc,
	      "nBuffer" : this.nBuffer,
	      "vBuffer" : this.vBuffer,
	      "tBuffer" : this.tBuffer,
	      "modelName" : this.modelName,
	      "shininess" :this.shininess
	     };
    /*
    //Uncomment this to create actual copies,
     // Not just pointers.
    var m =  {"points": this.points.slice(0),
	      "normals": this.normals.slice(0),
	      "polys": this.pols.slice(0)};
    */
    return m;

};

Model.prototype.swapColor = function(color){
    var blue = [0.0,0.0,1.0,1.0];
    var yellow= [1.0,1.0,0.0,1.0];
    if(vec4.equal(this.color,blue)){
	this.setColor(yellow);
    } else this.setColor(blue);
};

Model.prototype.setColor = function(color){
    this.color = color;
    if(cache.hasColor(this.modelName,colorToName(this.color))){
	this.cBuffer = cache.getColor(this.modelName,colorToName(this.color));
	this.colorsNeedUpdate = false;
	return;
    } 
    if(this.points){
	this.flatColors = 
	    this.flatColors || new Float32Array(4*this.points.length);
	for(var i in this.points){
	    for(var j = 0; j < color.length;j++){
		this.flatColors[4*i+j] = color[j];
	    }
	}
    }
    //We do not have access to gl here.
    this.colorsNeedUpdate = true;
};

Model.prototype.updateColorBuffer = function(gl){
    if(cache.hasColor(this.modelName,colorToName(this.color))){
	this.cBuffer = cache.getColor(this.modelName,colorToName(this.color));
    } else {
	    this.cBuffer = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, this.flatColors, gl.STATIC_DRAW );
	    cache.putColor(this.modelName,colorToName(this.color),this.nBuffer);
	}
    this.colorsNeedUpdate = false;

};

Model.prototype.render = function(gl,transformMatrix){
    //Most of these happen only once
    if(!this.glInitialized){this.glInit(gl);}
    if(!this.texture){this.texture = createSolidTexture([1.0,1.0,1.0,1.0],gl);}
    if(this.colorsNeedUpdate){this.updateColorBuffer(gl);}

    if(!transformMatrix){var transformMatrix = mat4.identity(mat4.create());};

    gl.uniformMatrix4fv(gl.objMLoc, false,
	mat4.multiply(transformMatrix,this.objMatr,mat4.create())
    );

    if(gl.vColor && gl.vColor > 0){
	gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
	gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );
    }

    gl.uniform1f( gl.shininess,this.shininess || materialShininess );
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

   
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.vertexAttribPointer( gl.vNormal, 4, gl.FLOAT, false, 0, 0 );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, this.texture );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer );
    gl.vertexAttribPointer( gl.vTex, 2, gl.FLOAT, false, 0, 0 );


    gl.drawArrays( gl.TRIANGLES, 0, this.points.length);
};



Model.prototype.isVisited = false;

Model.prototype.markVisited = function(){
    var white= [1.0,1.0,1.0,1.0];
    this.setColor(white);
    this.isVisited = true;
};

Model.prototype.markUnVisited = function(){
    var blue = [0.5,0.5,0.5,1.0];
    this.setColor(blue);
    this.isVisited = false;
};
