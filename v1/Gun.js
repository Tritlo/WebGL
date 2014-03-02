function Gun(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
}

Gun.prototype.canDie = false;
Gun.prototype.isDead = false;
Gun.prototype.shouldFire = false;
Gun.prototype.colors = [ 1.0, 0.0, 0.0, 1.0,
			 1.0, 0.0, 0.0, 1.0,
			 1.0, 0.0, 0.0, 1.0];

Gun.prototype.render = function(gl){
    var loc = this.loc;
    var points = [ [loc[0], loc[1] + 30]
		   , [loc[0]-30, loc[1]-10]
		   , [loc[0]+30,loc[1]-10]];
    points = points.map(normalizePos);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( gl.program.vPos, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( gl.program.vCol, 4, gl.FLOAT, false, 0, 0 );
    
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

};

Gun.prototype.fire = function(){
    entityManager.addEntity(new Bullet({"loc": [this.loc[0],this.loc[1] + 45]}));
};

Gun.prototype.update = function(du){
    this.loc[0] = mouse[0];
    if (this.shouldFire){
	this.fire();
	this.shouldFire = false;
    }
};
