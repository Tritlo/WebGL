function Model(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    this.init();
    this.loc = [0.0,0.0,0.0,1.0];
    this.objMatr = mat4.identity(mat4.create());
}
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
    var funcMatr = mat4.translate(mat4.identity(mat4.create()),t);
    this.updateObjM(funcMatr);
};

Model.prototype.scale= function(s){
    var funcMatr = mat4.scale(mat4.identity(mat4.create()),s);
    this.updateObjM(funcMatr);
};

Model.prototype.rotate= function(angle,axis){
    var funcMatr = mat4.scale(mat4.identity(mat4.create()),angle,axis);
    this.updateObjM(funcMatr);
    mat4.multiplyVec4(funcMatr,this.loc);
};

//Returns a copy of this model, while referring to the same
//Points, normals and pols
Model.prototype.modelCopy = function() {
    var m =  {"points": this.points,
	      "normals": this.normals,
	      "polys": this.pols};
    /*
    //Uncomment this to create actual copies,
     // Not just pointers.
    var m =  {"points": this.points.slice(0),
	      "normals": this.normals.slice(0),
	      "polys": this.pols.slice(0)};
    */
    return new Model(m);
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
    this.vertexColors = [];
    this.colors = [];
    for(var i in this.points){
	this.vertexColors.push(color);
        this.colors.push( color );
    }
};


Model.prototype.render = function(gl,transformMatrix){
    if(!transformMatrix){
	var transformMatrix = mat4.identity(mat4.create());
    };

    gl.uniformMatrix4fv(
	gl.objMLoc,
	false,
	mat4.multiply(transformMatrix,this.objMatr,mat4.create())
    );
    if(gl.vColor && gl.vColor > 0){
	gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.colors)),
		       gl.STATIC_DRAW );
	gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.points)),
		   gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

    
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.normals)),
		   gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vNormal, 4, gl.FLOAT, false, 0, 0 );

    /*gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.texCoordsArray),
     gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vTex, 2, gl.FLOAT, false, 0, 0 );
     */
    gl.drawArrays( gl.TRIANGLES, 0, this.points.length);
};

