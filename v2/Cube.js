//Cube.js (C) 2014 Matthias Pall Gissurarson
function Cube(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    this.init();
    this.loc = [0.0,0.0,0.0,1.0];
    this.normal = [0.0,1.0,0.0,0.0];
    this.direction = [0.0,0.0,1.0,0.0];
    
    this.rotSpeed = 0;
    this.rotSpeeds = [];
    this.rotCenter = [0.0,0.0,0.0];
    this.rotCenters = [];
    this.rotAxis = [0,1,0];
    this.rotAxises = [];

    this.rotateAroundSelf = false;
    this.selfRotateSpeed = 1;
    this.selfRotateAxis = [0,1,0];
    
    this.objMatr = mat4();
    this.verticesUptoDate = true;
};

Cube.prototype.renderLines = true;
Cube.prototype.renderVertices = false;



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
        vec4( -0.5, -0.5,  0.5, 1.0), vec4( -0.5,  0.5,  0.5, 1.0),
        vec4(  0.5,  0.5,  0.5, 1.0), vec4(  0.5, -0.5,  0.5, 1.0),
        vec4( -0.5, -0.5, -0.5, 1.0), vec4( -0.5,  0.5, -0.5, 1.0),
        vec4(  0.5,  0.5, -0.5, 1.0), vec4(  0.5, -0.5, -0.5, 1.0)
    ];
    
    this.lineVertices = [
	vec4( -0.5, -0.5, -0.5, 1.0), vec4(  0.5, -0.5, -0.5, 1.0),
	vec4( -0.5, -0.5, -0.5, 1.0), vec4( -0.5,  0.5, -0.5, 1.0),
	vec4( -0.5, -0.5, -0.5, 1.0), vec4( -0.5, -0.5,  0.5, 1.0),
	vec4(  0.5,  0.5,  0.5, 1.0), vec4( -0.5,  0.5,  0.5, 1.0),
	vec4(  0.5,  0.5,  0.5, 1.0), vec4(  0.5, -0.5,  0.5, 1.0),
	vec4(  0.5,  0.5,  0.5, 1.0), vec4(  0.5,  0.5, -0.5, 1.0),
	vec4( -0.5,  0.5, -0.5, 1.0), vec4(  0.5,  0.5, -0.5, 1.0),
	vec4( -0.5,  0.5, -0.5, 1.0), vec4( -0.5,  0.5,  0.5, 1.0),
	vec4(  0.5, -0.5,  0.5, 1.0), vec4( -0.5, -0.5,  0.5, 1.0),
	vec4(  0.5, -0.5,  0.5, 1.0), vec4(  0.5, -0.5, -0.5, 1.0),
	vec4( -0.5,  0.5,  0.5, 1.0), vec4( -0.5, -0.5,  0.5, 1.0),
	vec4(  0.5,  0.5, -0.5, 1.0), vec4(  0.5, -0.5, -0.5, 1.0)
       ];

    
    var  brightGreen = [0.0,1.0,0.0,1.0];
    this.vertexColors = [];
    var vColor = this.vColor || brightGreen; 
    var vColors = this.vColors || [vColor];
    var vclen = vColors.length;
    for(var i in this.vertices){
	this.vertexColors.push(vColors[i%vclen]);
	}

    this.lineColors = [];
    var lColor = this.lColor || vColor;// || brightGreen;
    var lColors;
    if (this.lColor){
	lColors = this.lColors || [lColor];
    } else {
	lColors = this.lColors || vColors || [lColor];
    }
    var lclen = lColors.length;
    for(var i in this.lineVertices){
	this.lineColors.push(lColors[i%lclen]);
	}
    
    this.setVertices();

};

Cube.prototype.setVertices = function(){
    this.points = [];
    this.colors = [];
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
	this.objMatr = mat4();
	this.verticesUptoDate = true;
    }
};


Cube.prototype.quad = function(a, b, c, d) {
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; ++i ) {
        this.points.push( this.vertices[indices[i]] );
        this.colors.push( this.vertexColors[indices[i]] );
    }
};


Cube.prototype.render = function(gl){

    if(gl.objMLoc){
	gl.uniformMatrix4fv(gl.objMLoc,false,flatten(this.objMatr));
    } else {
	this.updateVertices();
    }
    if(this.renderVertices){
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.colors)), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.points)), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

	gl.drawArrays( gl.TRIANGLES, 0, this.points.length);
    }
    if(this.renderLines){
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.lineColors)), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(this.lineVertices), gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

	gl.drawArrays( gl.LINES, 0, this.lineVertices.length );
    }
};

Cube.prototype.applyMatrix = function(funcMatr){

    for(var i = 0; i < this.vertices.length; i++){
	this.vertices[i] = mulMV(funcMatr,this.vertices[i]);
    };
    for(var i = 0; i < this.lineVertices.length; i++){
	this.lineVertices[i] = mulMV(funcMatr,this.lineVertices[i]);
    };
    this.setVertices();
};


Cube.prototype.translate = function(x,y,z){
    if (x.length){
	y = x[1];
	z = x[2];
	x = x[0];
	}
    var funcMatr = translate(x,y,z);
    this.loc = add(this.loc,[x,y,z,0]);
    this.objMatr = mult(funcMatr,this.objMatr);
    this.verticesUptoDate = false;
};

Cube.prototype.scale = function(x,y,z){
    if (x.length){
	y = x[1];
	z = x[2];
	x = x[0];
	}
    var funcMatr = mat4();
    funcMatr[0][0] = x;
    funcMatr[1][1] = y;
    funcMatr[2][2] = z;
    this.objMatr = mult(funcMatr,this.objMatr);
    this.verticesUptoDate = false;
};

Cube.prototype.rotate = function(angle,axis){
    var funcMatr = rotate(angle,axis);
    this.loc = mulMV(funcMatr,this.loc);
    this.objMatr = mult(funcMatr,this.objMatr);
    this.verticesUptoDate = false;
};


