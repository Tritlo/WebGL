var gl;
var points = [];
var colors = [];
var unAddedPoints = [];
var canvas;
var posBuffer, colorBuffer;
var program;
var currColor = [];
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    currColor = [Math.random(), Math.random(),Math.random(),1.0];
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    gl.program = program;
    
    // Load the data into the GPU
    program.vPos = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray(program.vPos);

    program.vCol = gl.getAttribLocation(program,"vertColor");
    gl.enableVertexAttribArray(program.vCol);
    
    posBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, posBuffer );

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    console.log(points);
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( program.vPos, 2, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( program.vCol, 4, gl.FLOAT, false, 0, 0 );
    
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    
    gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(unAddedPoints), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( program.vPos, 2, gl.FLOAT, false, 0, 0 );
    
    var pointColors = [];
    for(var i = 0; i < unAddedPoints.length; i++){
	pointColors = pointColors.concat(currColor);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(pointColors), gl.DYNAMIC_DRAW );
    gl.vertexAttribPointer( program.vCol, 4, gl.FLOAT, false, 0, 0 );
    
    gl.drawArrays( gl.POINTS, 0, unAddedPoints.length );
};

function addPoint(p){
    unAddedPoints.push(p);
    if (unAddedPoints.length === 3){
	points = points.concat(unAddedPoints);
	for(var i = 0; i < 3; i++){
	    colors = colors.concat(currColor);
	}
	unAddedPoints = [];
        currColor = [Math.random(), Math.random(),Math.random(),1.0];
    }
    render();
}

function handleMouse(evt) {
    if(evt.which === 1){
	var mouseX = evt.clientX - canvas.offsetLeft;
	var mouseY = evt.clientY - canvas.offsetTop;
	mouseX = 2*mouseX/canvas.width -1;
	mouseY = 1 - 2*mouseY/canvas.height;
	addPoint(vec2(mouseX,mouseY));
    } else {
	unAddedPoints = [];
	points =[];
	render();
    }
}

window.addEventListener("mousedown", handleMouse);
