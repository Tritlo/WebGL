var gl;
var vertices;
var points;
var currentSteps = 0;
var currentDir = vec2(0,0);
var canvas;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    vertices = [
        vec2( -0.5, -0.5 ),
        vec2(  0,  0.5 ),
        vec2(  0.5, -0.5 )
    ];
    vertices = vertices.map(function(v){
	return scale(0.1,v);
    });


    points = vertices.slice();
    
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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );

    var vPos = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPos, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPos );

    window.requestAnimationFrame(main);
};


function getSteps(){
    return Math.floor(Math.random()*10)+1;
};

function getDir(){
    var rand = vec2(Math.random(),Math.random());
    var sz = 1/200;
    return scale(-sz +2*sz*Math.random(),rand);
};


function main(){
    //Sja webgl-utils. Maelt med ad gera svona.
    window.requestAnimFrame(main,canvas);
    if(currentSteps > 0){
	currentSteps--;
    } else {
	currentSteps = getSteps();
	currentDir = getDir();
    }
    points = points.map(function (p){return add(p,currentDir);});
    render();
};
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(points) );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
};
