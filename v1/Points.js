function Points(descr){
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    
};

Points.prototype.colors = [
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0,
    0.0, 0.0, 0.0, 1.0];

Points.prototype.val = 0;
Points.prototype.height = 5;
Points.prototype.width = 10;
Points.prototype.add = function(num){
    this.val += num;
};


Points.prototype.render = function(gl){
    for(var i = 0; i < this.val; i++){
	var loc = [i*(2*this.width+5)+20,512-this.height-2];
	var points = [
	[loc[0]-this.width, loc[1] - this.height],
	[loc[0]-this.width, loc[1] + this.height],
	[loc[0]+this.width, loc[1] - this.height],
	[loc[0]+this.width, loc[1] + this.height]];
	points = points.map(normalizePos);
	gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
	gl.vertexAttribPointer( gl.program.vPos, 2, gl.FLOAT, false, 0, 0 );

	gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.DYNAMIC_DRAW );
	gl.vertexAttribPointer( gl.program.vCol, 4, gl.FLOAT, false, 0, 0 );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, points.length );
    }
};

