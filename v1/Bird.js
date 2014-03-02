function Bird(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    var rand = Math.random();
    var startx = rand > 0.5? 0 : 500;
    var speed = Math.random()*1 + 1;
    var velx = rand > 0.5? speed : -1.0*speed;
    
    this.velocity = [velx,0];
    var h = 450 + Math.random()*40;
    this.loc = [startx,h];
    this.update(5);
    
}

Bird.prototype.velocity = vec2(1,0);
Bird.prototype.colors = [   0.0, 1.0, 0.0, 1.0,
			    0.0, 1.0, 0.0, 1.0,
			    0.0, 1.0, 0.0, 1.0,
			    0.0, 1.0, 0.0, 1.0];
Bird.prototype.hitBox = null;

Bird.prototype.render = function(gl){
    var points = this.hitBox.map(normalizePos);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( gl.program.vPos, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( gl.program.vCol, 4, gl.FLOAT, false, 0, 0 );
    
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
    };

Bird.prototype.isDead = false;
Bird.prototype.canDie = true;
Bird.prototype.width = 15;
Bird.prototype.height = 10;

Bird.prototype.update = function(du){
    var prevLoc = this.loc.slice(0);
    var nextLoc = add(prevLoc,scale(du,this.velocity));
    this.loc = nextLoc;
    var loc = this.loc;
    this.hitBox = [
	[loc[0]-this.width, loc[1] - this.height],
	[loc[0]-this.width, loc[1] + this.height],
	[loc[0]+this.width, loc[1] - this.height],
	[loc[0]+this.width, loc[1] + this.height]];
    if(!(between(loc[0],0,canvas.width)) || !(between(loc[1],0,canvas.height))){
	this.isDead = true;
	console.log("dead", this);
	entityManager.numBirds--;
    }
};
