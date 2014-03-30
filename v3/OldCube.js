//Cube.js (C) 2014 Matthias Pall Gissurarson
function Cube(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    this.init();
    this.loc = [0.0,0.0,0.0,1.0];
    
    this.rotSpeed = 0;
    this.rotSpeeds = [];
    this.rotCenter = [0.0,0.0,0.0];
    this.rotCenters = [];
    this.rotAxis = [0,1,0];
    this.rotAxises = [];

    this.rotateAroundSelf = false;
    this.selfRotateSpeed = 1;
    this.selfRotateAxis = [0,1,0];
    
    this.objMatr = mat4.identity(mat4.create());
    this.verticesUptoDate = true;
};

Cube.prototype.renderLines = false;
Cube.prototype.renderVertices = true;



Cube.prototype.update = function(du){
    if(this.rotateAroundSelf){
	this.rotateAround(this.loc,this.selfRotateSpeed,this.selfRotateAxis);
    }
    for(var i = 0; i < this.rotSpeeds.length; i++){
	this.rotateAround(this.rotCenters[i] || this.rotCenter,
			  (this.rotSpeeds[i] || this.rotSpeed)*du,
			  this.rotAxises[i] || this.rotAxis);
    }
};

Cube.prototype.rotateAround = function(center, angle,axis){
    this.translate(-center[0],-center[1],-center[2]);
    this.rotate(angle,axis);
    this.translate(center[0],center[1],center[2]);
};

Cube.prototype.init = function (){
    this.vertices =  [
	    vec4.create([ -0.5, -0.5,  0.5, 1.0]), vec4.create([ -0.5,  0.5,  0.5, 1.0]),
	    vec4.create([  0.5,  0.5,  0.5, 1.0]), vec4.create([  0.5, -0.5,  0.5, 1.0]),
	    vec4.create([ -0.5, -0.5, -0.5, 1.0]), vec4.create([ -0.5,  0.5, -0.5, 1.0]),
	    vec4.create([  0.5,  0.5, -0.5, 1.0]), vec4.create([  0.5, -0.5, -0.5, 1.0])
	];

	this.lineVertices = [
	    vec4.create([ -0.5, -0.5, -0.5, 1.0]), vec4.create([  0.5, -0.5, -0.5, 1.0]),
	    vec4.create([ -0.5, -0.5, -0.5, 1.0]), vec4.create([ -0.5,  0.5, -0.5, 1.0]),
	    vec4.create([ -0.5, -0.5, -0.5, 1.0]), vec4.create([ -0.5, -0.5,  0.5, 1.0]),
	    vec4.create([  0.5,  0.5,  0.5, 1.0]), vec4.create([ -0.5,  0.5,  0.5, 1.0]),
	    vec4.create([  0.5,  0.5,  0.5, 1.0]), vec4.create([  0.5, -0.5,  0.5, 1.0]),
	    vec4.create([  0.5,  0.5,  0.5, 1.0]), vec4.create([  0.5,  0.5, -0.5, 1.0]),
	    vec4.create([ -0.5,  0.5, -0.5, 1.0]), vec4.create([  0.5,  0.5, -0.5, 1.0]),
	    vec4.create([ -0.5,  0.5, -0.5, 1.0]), vec4.create([ -0.5,  0.5,  0.5, 1.0]),
	    vec4.create([  0.5, -0.5,  0.5, 1.0]), vec4.create([ -0.5, -0.5,  0.5, 1.0]),
	    vec4.create([  0.5, -0.5,  0.5, 1.0]), vec4.create([  0.5, -0.5, -0.5, 1.0]),
	    vec4.create([ -0.5,  0.5,  0.5, 1.0]), vec4.create([ -0.5, -0.5,  0.5, 1.0]),
	    vec4.create([  0.5,  0.5, -0.5, 1.0]), vec4.create([  0.5, -0.5, -0.5, 1.0])
       ];

    
    var  brightGreen = [0.0,1.0,0.0,1.0];
    var  white = [1.0,1.0,1.0,1.0];
    var  black = [0.0,0.0,0.0,1.0];
    this.vertexColors = [];
    //var vColor = this.vColor || brightGreen;
    var vColor = this.vColor || white;
    var vColors = this.vColors || [vColor];
    var vclen = vColors.length;
    for(var i in this.vertices){
	this.vertexColors.push(vColors[i%vclen]);
	}

    this.lineColors = [];
    //var lColor = this.lColor || vColor || brightGreen;
    var lColor = this.lColor || vColor || brightGreen;
    //var lColor = this.lColor || black;// || brightGreen;
    var lColors;
    if (this.lColor){
	lColors = this.lColors || [this.lColor];
    } else {
	lColors = this.lColors || [lColor];
    }
    var lclen = lColors.length;
    for(var i in this.lineVertices){
	this.lineColors.push(lColors[i%lclen]);
	}
    
    this.texCoords = [[0,0],[0,1],[1,1],[1,0]] || this.texCoords;
    if(this.textureSrc){
	this.initTexture();
    } else{
	this.texture = createSolidTexture(vColor);
    };
    this.setVertices();
};

Cube.prototype.initTexture = function(){
	this.texture = gl.createTexture();
	this.image = new Image();
        var cbe = this;
	this.image.onload = function() {
	    console.log("loaded");
	    cbe.configureTexture();
	};
	this.image.src = this.textureSrc;
};

Cube.prototype.configureTexture = function(){
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, null);
};

Cube.prototype.setVertices = function(){
    this.points = [];
    this.colors = [];
    this.texCoordsArray = [];
    this.quad( 1, 0, 3, 2 );
    this.quad( 2, 3, 7, 6 );
    this.quad( 3, 0, 4, 7 );
    this.quad( 6, 5, 1, 2 );
    this.quad( 4, 5, 6, 7 );
    this.quad( 5, 4, 0, 1 );
};

Cube.prototype.updateVertices = function(){
    if(!this.verticesUptoDate){
	this.applyMatrix(this.objMatr);
	this.objMatr = mat4.identity(mat4.create());
	this.verticesUptoDate = true;
    }
};


Cube.prototype.quad = function(a, b, c, d) {
    var indices = [ a, b, c, a, c, d ];
    var texs =    [ 0, 1, 2, 0, 2, 3 ];
    for ( var i = 0; i < indices.length; ++i ) {
        this.points.push( this.vertices[indices[i]] );
        this.colors.push( this.vertexColors[indices[i]] );
	if(this.texCoords){

	this.texCoordsArray.push(this.texCoords[texs[i]]);
	};
    }
};


Cube.prototype.render = function(gl,transformMatrix){
    if(!transformMatrix){
	var transformMatrix = mat4.identity(mat4.create());
    };

    gl.uniformMatrix4fv(
	gl.objMLoc,
	false,
	mat4.multiply(transformMatrix,this.objMatr,mat4.create())
    );
    if(this.renderVertices){
	if(gl.vColor && gl.vColor > 0){
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,
		       new Float32Array(flatten(this.colors)), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );
	    }

	gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,
		       new Float32Array(flatten(this.points)), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

	if(gl.vTex && gl.vTex > 0){
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture( gl.TEXTURE_2D, this.texture );
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,
		       flatten(this.texCoordsArray), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vTex, 2, gl.FLOAT, false, 0, 0 );
	    }
	
	gl.drawArrays( gl.TRIANGLES, 0, this.points.length);
    }
    if(this.renderLines){
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,
		       flatten(this.lineColors), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER,
		       flatten(this.lineVertices), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.drawArrays( gl.LINES, 0, this.lineVertices.length );
    }
	gl.bindTexture( gl.TEXTURE_2D, null );
};

Cube.prototype.applyMatrix = function(funcMatr){

    for(var i = 0; i < this.vertices.length; i++){
	mat4.multiplyVec4(funcMatr,this.vertices[i]);
    };
    for(var i = 0; i < this.lineVertices.length; i++){
	mat4.multiplyVec4(funcMatr,this.lineVertices[i]);
    };
    this.setVertices();
};


Cube.prototype.translate = function(x,y,z){
    if (x.length){
	y = x[1];
	z = x[2];
	x = x[0];
	}
    vec4.add(this.loc,[x,y,z,0],this.loc);
    var funcMatr = mat4.translate(mat4.identity(mat4.create()),[x,y,z]);
    var obm = mat4.multiply(funcMatr,this.objMatr,mat4.create());
    //mat4.translate(this.objMatr,[x,y,z],this.objMatr);
    var funcMatr = mat4.translate(mat4.identity(mat4.create()),[x,y,z]);
    var obm = mat4.multiply(funcMatr,this.objMatr,mat4.create());
    this.objMatr = obm;
    this.verticesUptoDate = false;
};

Cube.prototype.scale = function(x,y,z){
    if (x.length){
	y = x[1];
	z = x[2];
	x = x[0];
	}
    var funcMatr = mat4.scale(mat4.identity(mat4.create()),[x,y,z]);
    var obm = mat4.multiply(funcMatr,this.objMatr,mat4.create());
    this.objMatr = obm;
    //mat4.scale(this.objMatr,[x,y,z],this.objMatr);
    this.verticesUptoDate = false;
};

Cube.prototype.rotate = function(angle,axis){
    var funcMatr = mat4.rotate(mat4.identity(mat4.create()),angle,axis);
    var obm = mat4.multiply(funcMatr,this.objMatr,mat4.create());
    this.objMatr = obm;
    mat4.multiplyVec4(funcMatr,this.loc);
    //mat4.rotate(this.objMatr,angle,axis,this.objMatr);
    this.verticesUptoDate = false;
};

Cube.prototype.addTrans = function(funcMatr){
    mat4.multiply(funcMatr,this.objMatr,this.objMatr);
    this.verticesUptoDate = false;
};

