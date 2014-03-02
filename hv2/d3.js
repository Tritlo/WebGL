var gl;
var vertices;
var points;
const depth = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];


    points = vertices.slice();
    for(var i = 0; i< depth; i++){
	var newPoints = [points[0]];
	for(var j = 1; j < points.length; j++){
	    var a = points[j-1];
	    var b = points[j];
	    var m = scale(0.5,add(b,a));
	    var delta = scale(-0.05+0.1*Math.random(),vec2(Math.random(),Math.random()));
	    var m = add(m,delta);
	    newPoints = newPoints.concat([m,b]);
	};
	points = newPoints.slice();
    };
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    render();
};



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.lineWidth(5.0);
    gl.drawArrays( gl.LINE_LOOP, 0, points.length );
};
