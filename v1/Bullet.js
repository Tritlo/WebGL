function Bullet(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
}

Bullet.prototype.velocity = vec2(0,5);

Bullet.prototype.colors = [ 1.0, 0.0, 1.0, 1.0,
			    0.0, 0.0, 1.0,1.0,
			    0.0, 0.0, 1.0, 1.0,
			    1.0, 0.0, 1.0, 1.0];

Bullet.prototype.render = function(gl){
    var loc = this.loc;
    if(this.hitBox){
    var points = this.hitBox.map(normalizePos);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( gl.program.vPos, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( gl.program.vCol, 4, gl.FLOAT, false, 0, 0 );
    
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
	}
    };

Bullet.prototype.isDead = false;
Bullet.prototype.canDie = false;
Bullet.prototype.width = 3;
Bullet.prototype.height = 7;

Bullet.prototype.update = function(du){
    var prevLoc = this.loc.slice(0);
    var nextLoc = add(prevLoc,scale(du,this.velocity));
    this.loc = nextLoc;
    this.isDead = entityManager.killFrom(this);
    this.loc = nextLoc;
    var loc = this.loc;
    this.hitBox = [
	[loc[0]-this.width, loc[1] - this.height],
	[loc[0]-this.width, loc[1] + this.height],
	[loc[0]+this.width, loc[1] - this.height],
	[loc[0]+this.width, loc[1] + this.height]];
    if(!(between(loc[0],0,canvas.width)) || !(between(loc[1],0,canvas.height))){
	this.isDead = true;
    }
};
