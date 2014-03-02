
var gl;
var vertices;
var points;

const NumPoints = 250000;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    vertices = [
        vec2( -1, -1 ),
        vec2(  -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];


    var scaleConst = 1/2.1;
    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[1], vertices[2] );
    var p = scale( scaleConst, add( u, v ) );

    // Add our randomly chosen point into our array of points
    points = [ p ];

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 4);
        p = add( points[i], vertices[j] );
        p = scale( scaleConst, p );
        points.push( p );
    }

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
    gl.drawArrays( gl.POINTS, 0, points.length );
};
