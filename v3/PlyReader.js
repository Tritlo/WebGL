
function point3D(x, y, z)
{
    this.x = x;
    this.y = y;
    this.z = z;
}


var PlyReader =(function(){
    var parser = {
	//Use: plyReader.parse(data);
	//Pre: data is a string of a ply file
	//Pos: returns an object with the elements of the plyfile
	parse: function(data,callback){
	    var hasNormal = false;
	    // Read header
	    while(data.length)
	    {
	      var retval = data.match(/.*/);
	      var str = retval[0];
	      data = data.substr(data.indexOf("\n")+1);
	      retval = str.match(/element (\w+) (\d+)/);
	      if(retval)
	      {
		if(retval[1] == "vertex")
		    var npoints = parseInt(retval[2]);
		if(retval[1] == "face")
		    var npolys = parseInt(retval[2]);
	      }
	      if(str == "property float nx")
		  hasNormal = true;
	      if(str == "end_header")
		  break;
	    }

	    // Read points
	    var minPoint = new point3D(Infinity, Infinity, Infinity);
	    var maxPoint = new point3D(-Infinity, -Infinity, -Infinity);
	    var vertices = [];
	    var vertexNormals = [];
	    var vNorms = [];
	    for (var i = 0; i < npoints; i++) 
	    {
		retval = data.match(/([\d.-]+ ?)+/);
		str = retval[0];
		data = data.substr(data.indexOf("\n")+1);
		retval = str.match(/([\d.-]+)/g);
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
	    var polys = [];
	    var index = 0;
	    var newVertices = [];
	    for (var i = 0; i < npolys; i++) 
	    {
		retval = data.match(/(\d+ ?)+/);
		str = retval[0];
		data = data.substr(data.indexOf("\n")+1);
		retval = str.match(/(\d+)/g);
		var nvertex = parseInt(retval[0]);
		var aIndex = parseInt(retval[1]);
		var bIndex = parseInt(retval[2]);
		var cIndex = parseInt(retval[3]);
		// Polygon normal
		var p0 = new point3D(vertices[aIndex*3+0],
				     vertices[aIndex*3+1],
				     vertices[aIndex*3+2]);
		var p1 = new point3D(vertices[bIndex*3+0],
				     vertices[bIndex*3+1],
				     vertices[bIndex*3+2]);
		var p2 = new point3D(vertices[cIndex*3+0],
				     vertices[cIndex*3+1],
				     vertices[cIndex*3+2]);

		if(!hasNormal)
		{
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
		} else {
		    var n0 = new point3D(vNorms[aIndex*3+0],
					 vNorms[aIndex*3+1],
					 vNorms[aIndex*3+2]);
		    var n1 = new point3D(vNorms[bIndex*3+0],
					 vNorms[bIndex*3+1],
					 vNorms[bIndex*3+2]);
		    var n2 = new point3D(vNorms[cIndex*3+0],
					 vNorms[cIndex*3+1],
					 vNorms[cIndex*3+2]);
		}

		var inda = index++; var indb = index++; var indc = index++;
		polys.push(inda, indb, indc);
		pols.push([inda,indb,indc]);
		newVertices.push(p0.x, p0.y, p0.z);
		newVertices.push(p1.x, p1.y, p1.z);
		newVertices.push(p2.x, p2.y, p2.z);
		if(!hasNormal)
		{	
		  vertexNormals.push(normal.x, normal.y, normal.z);
		  vertexNormals.push(normal.x, normal.y, normal.z);
		  vertexNormals.push(normal.x, normal.y, normal.z);
		}
		else{
		  vertexNormals.push(n0.x, n0.y, n0.z);
		  vertexNormals.push(n1.x, n1.y, n1.z);
		  vertexNormals.push(n2.x, n2.y, n2.z);
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
	    // Create model
	    var model = new Model({"points": points, "normals":normals, "pols":pols});
	    if(callback){
		callback(model);
		return model;
	    } else {
		return model;
	    }
	},
	//works both in node.js and on web.
	read: function(file,callback){
	    var data;
	    if(typeof window === 'undefined'){
		var fs = require("fs");
		data = fs.readFileSync(file)+'';
		this.parse(data,callback);
	    } else {
		var request = new XMLHttpRequest();
		var reader = this;
		request.open('GET', file, true);
		request.onload = function() {
		  if (this.status >= 200 && this.status < 400){
		      data = this.response;
		      reader.parse(data,callback);

		  }
		};
		request.onerror = function() {
		    console.log("Request error for " + file );
		};
		request.send();
	    }
	}
    };
    Parser = function() {};
    Parser.prototype = parser;
    parser.Parser = Parser;
    return new Parser;
});
