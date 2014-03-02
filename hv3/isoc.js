var canvas;
var gl;

var NumVertices  = 60;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var direction = -1;
var shouldUpdate = false;

var program;
var thetaLoc;
var vColor;
var cBuffer;
var vBuffer;
var vPosition;

var k = 0;

var spin = [0,0,0];
var mouse = [0,0];
var mouseDown = false;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    colorIsoc();
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    vColor = gl.getAttribLocation( program, "vColor" );
    cBuffer = gl.createBuffer();
    vBuffer = gl.createBuffer();
    vPosition = gl.getAttribLocation( program, "vPosition" );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
};


function colorIsoc(){
    function liToVec(li){
	return vec3(li[0],li[1],li[2]);
    }
    
    function genRandomColor(){
	function getRandC(){
	    var rand = 0.7*Math.random() + 0.2;
	    return rand;
	}
	var randCol = [getRandC(),getRandC(),getRandC(),1.0];
	return randCol;
	
    }
    var phi =(1 + Math.sqrt(5)) / 2.0;
    var a = 0.5;
    var b = 1/(2.0*phi);
    //24 og 27
    var coords =
    [ [0, b,-a], [ b, a, 0], [-b, a, 0]//0
     ,[0, b, a], [-b, a, 0], [ b, a, 0]//3
     ,[0, b, a], [ 0,-b, a], [-a, 0, b]//6
     ,[0, b, a], [ a, 0, b], [ 0,-b, a]//9
     ,[0, b,-a], [ 0,-b,-a], [ a, 0,-b]//12
     ,[0, b,-a], [-a, 0,-b], [ 0,-b,-a]//15
     ,[0,-b, a], [ b,-a, 0], [-b,-a, 0]//18
     ,[0,-b,-a], [-b,-a, 0], [ b,-a, 0]//21
     ,[-b, a, 0], [-a, 0, b], [-a, 0,-b]//24
     ,[-b,-a, 0], [-a, 0,-b], [-a, 0, b]//27
     ,[b, a, 0], [ a, 0,-b], [ a, 0, b]
     ,[b,-a, 0], [ a, 0, b], [ a, 0,-b]
     ,[0, b, a], [-a, 0, b], [-b, a, 0]
     ,[0, b, a], [ b, a, 0], [ a, 0, b]//
     ,[0, b,-a], [-b, a, 0], [-a, 0,-b]
     ,[0, b,-a], [ a, 0,-b], [ b, a, 0]
     ,[0,-b,-a], [-a, 0,-b], [-b,-a, 0]
     ,[0,-b,-a], [ b,-a, 0], [ a, 0,-b]
     ,[0,-b, a], [-b,-a, 0], [-a, 0, b]
     ,[0,-b, a], [ a, 0, b], [ b,-a, 0]];
    points = coords;
    colors = [];
    var black = [0,0,0,1];
    for(var i = 0; i < points.length; i+= 3){
	var color = [0,0,0,1];
	color = genRandomColor();
	for(var j = 0; j < 3; j++){
		colors.push(color);
	}
    };
};

function handleMouse(evt,type) {
    
    
    var rect = canvas.getBoundingClientRect();
    var pos = [rect.left,rect.top];
    if(type == "up"){
	mouseDown = false;
    }
    if(type==="down") {
	mouseDown = true;
	}
    if(type === "move"){
	if (mouseDown){
	    var orig = [mouse[0],mouse[1]];
	    mouse = [evt.clientX - pos[0]-256,evt.clientY - pos[1]-256];
	    theta[1] += orig[0] - mouse[0];
	    theta[0] += orig[1] - mouse[1];
	}
    }
}


function handleMouseDown(evt) {handleMouse(evt,"down");};
function handleMouseMove(evt) {handleMouse(evt,"move");};
function handleMouseUp(evt) {handleMouse(evt,"up");};

window.addEventListener("mouseup", handleMouseUp);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
