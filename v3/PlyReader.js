//PlyReader.js (C) 2014 Matthias Pall Gissurarson
function point3D(x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
}
function getNormal(p0,p1,p2){
    var v1 = new point3D(p2.x - p1.x,
			 p2.y - p1.y,
			 p2.z - p1.z);
    var v2 = new point3D(p0.x - p1.x,
			 p0.y - p1.y,
			 p0.z - p1.z);
    var normal = new point3D(v1.y*v2.z-v2.y*v1.z,
			     v1.z*v2.x-v2.z*v1.x,
			     v1.x*v2.y-v2.x*v1.y);
    var normalLen = Math.sqrt(normal.x*normal.x
			      + normal.y*normal.y
			      + normal.z*normal.z);
    normal.x /= normalLen;
    normal.y /= normalLen;
    normal.z /= normalLen;

    return normal;
}

function getPoints(indices,vertices){
 var ps = [];
 for(var i = 0; i < indices.length; i ++){
	ps.push(new point3D(vertices[indices[i]*3+0],
			    vertices[indices[i]*3+1],
			    vertices[indices[i]*3+2]));
 }
 return ps;
}

var PlyReader =(function(){
    var parser = {
	//Use: plyReader.parse(data);
	//Pre: data is a string of a ply file
	//Pos: returns an object with the elements of the plyfile
	parse: function(data,callback){
	    var hasNormal = false;
	    var retval,nl,line;
	    // Read header
	    while(data.length)
	    {
	      // var retval = data.match(/.*/);
	      //var str = retval[0];
	      nl = data.indexOf("\n")+1;
              line = data.substr(0,nl-1).trim();
	      data = data.substr(nl);
		
	      retval = line.match(/element (\w+) (\d+)/);
	      if(retval)
	      {
		if(retval[1] === "vertex") var npoints = parseInt(retval[2]);
		if(retval[1] === "face") var npolys = parseInt(retval[2]);
	      }
	      if(line === "property float nx") hasNormal = true;
	      if(line === "end_header") break;
	    }

	    // Read points
	    var minPoint = new point3D(Infinity, Infinity, Infinity);
	    var maxPoint = new point3D(-Infinity, -Infinity, -Infinity);
	    var vertices = [];
	    var vertexNormals = [];
	    var vNorms = [];
	    for (var i = 0; i < npoints; i++) 
	    {
		nl = data.indexOf("\n")+1;
		line = data.substr(0,nl-1);
		data = data.substr(nl);

		retval = line.split(" ");
		var point = new point3D(parseFloat(retval[0]),
					parseFloat(retval[1]),
					parseFloat(retval[2]));

		vertices.push(point.x, point.y, point.z);

		if(hasNormal) vNorms.push(parseFloat(retval[3]),
					  parseFloat(retval[4]),
					  parseFloat(retval[5]));


		minPoint.x = Math.min(minPoint.x, point.x);
		minPoint.y = Math.min(minPoint.y, point.y);
		minPoint.z = Math.min(minPoint.z, point.z);
		maxPoint.x = Math.max(maxPoint.x, point.x);
		maxPoint.y = Math.max(maxPoint.y, point.y);
		maxPoint.z = Math.max(maxPoint.z, point.z);
	    }
	    // Polygons
	    var pols = [];
	    var newVertices = [];
	    for (var i = 0; i < npolys; i++) 
	    {
		nl = data.indexOf("\n")+1;
		line = data.substr(0,nl-1);
		data = data.substr(nl);

		retval = line.split(" ");
		var nvertex = parseInt(retval[0]);
		var indices = [];
		for(var j = 0; j < nvertex; j++)
		   indices.push(parseInt(retval[j+1]));
		
		// Polygon normal
		var ps = getPoints(indices,vertices);
		if(!hasNormal)
		{
		   var normal = getNormal(ps[0],ps[1],ps[2]);
		   var ns = [normal,normal,normal];
		} else {
		   var ns = getPoints(indices,vNorms);
		}

		pols.push(indices);
		for(var j = 0; j < 3; j++){
		    newVertices.push(ps[j].x, ps[j].y, ps[j].z);
		    vertexNormals.push(ns[j].x, ns[j].y, ns[j].z);
		}
		
		//If faces are declared as boxes,
		//not triangles.
		if (nvertex == 4){
		    ps.splice(1,1);
		    if(!hasNormal)
		    {	
			var normal = getNormal(ps[0],ps[1],ps[2]);
			var ns = [normal,normal,normal,normal];
		    }
		    ns.splice(1,1);
		    for(var j = 0; j < 3; j++){
			newVertices.push(ps[j].x, ps[j].y, ps[j].z);
			vertexNormals.push(ns[j].x, ns[j].y, ns[j].z);
		    }
		}
	    }
	    vertices = newVertices;


	    // Move to center of object
	    var centerMove = new point3D(-(maxPoint.x + minPoint.x)/2,
					 -(maxPoint.y + minPoint.y)/2,
					 -(maxPoint.z + minPoint.z)/2);
	    var scaleY = (maxPoint.y - minPoint.y) / 2;
	    var points = [];
	    var normals = [];
	    for (var i = 0; i < vertices.length; i+=3) 
	    {
	      vertices[i+0] += centerMove.x;
	      vertices[i+1] += centerMove.y;
	      vertices[i+2] += centerMove.z;

	      vertices[i+0] /= scaleY;
	      vertices[i+1] /= scaleY;
	      vertices[i+2] /= scaleY;

	      points.push(point4.create([vertices[i],
					 vertices[i+1],
					 vertices[i+2],
					 1]));
	      normals.push(point4.create([vertexNormals[i],
					  vertexNormals[i+1],
					  vertexNormals[i+2],
					  0]));
	    };
	    return {"points": points, "normals":normals, "polys": pols};
	},
	toModel: function(data,callback){
	    var model = new Model(data);
	    if(callback){
		callback(model);
	    }
	    return model;
	},
	getData: function(file,gl){
	    var data = loadFile(file);
	    var parsed = this.parse(data);
	    if(gl){
		parsed.vBuffer = gl.createBuffer();
		parsed.nBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(parsed.points)),
			       gl.STATIC_DRAW );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(parsed.normals)),
			       gl.STATIC_DRAW );
		parsed.numPoints = parsed.points.length;
	    }
	    return parsed;
	},
	//works both in node.js and on web.
	read: function(file,callback){
	    return this.toModel(this.getData(file),callback);
	}
    };
    Parser = function() {};
    Parser.prototype = parser;
    parser.Parser = Parser;
    return new Parser;
});
