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
    this.vertexColors = [];
    this.colors = [];
    var vColor = brightGreen;
    for(var i in this.points){
	this.vertexColors.push(vColor);
        this.colors.push( vColor );
    }
};

Model.prototype.render = function(gl){
    gl.uniformMatrix4fv(gl.objMLoc,false,this.objMatr);
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.colors)), gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.points)), gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

    /*
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(this.normals)), gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vNormal, 4, gl.FLOAT, false, 0, 0 );
     */

    /*gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture( gl.TEXTURE_2D, this.texture );
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.texCoordsArray), gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vTex, 2, gl.FLOAT, false, 0, 0 );
     */
    gl.drawArrays( gl.TRIANGLES, 0, this.points.length);
};

