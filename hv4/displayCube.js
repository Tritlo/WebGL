
var canvas;
var gl;

var NumVertices  = 36;


var spin = [0,0,0];
var mouse = [0,0];
var mouseDown = false;

var points = [];
var colors = [];
var blacks = [];
var cBuffer;
var vColor;
var vBuffer;
var vPosition;
var cube;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];
var direction = -1;

var thetaLoc;
var body = [];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var head  = [new Cube()];
    var torso= [new Cube()];
    var legs = [new Cube(),new Cube()];
    var arms = [new Cube(),new Cube()];

    head.map(function (a) {a.scale(2.5/10.0,2/10.0,0.2);});
    torso.map(function (a) {a.scale(0.8/7.0,4/10.0,0.2);});
    arms.map(function (a) {a.scale(0.6/7.0,2.5/10.0,0.2);});
    legs.map(function (a) {a.scale(0.7/7.0,3/10.0,0.2);});
    
    arms[0].rotate(-15,[0,0,1]);
    arms[1].rotate(15,[0,0,1]);

    torso[0].translate(0.0,0.0    +4 /10,0);
    head[0].translate( 0.0, 0.4   +4/10,0);
    arms[0].translate(-0.18, 0.08 +4/10,0);
    arms[1].translate( 0.18, 0.08 +4/10,0);
    legs[0].translate(-0.14,-0.25 +4/10,0);
    legs[1].translate( 0.14,-0.25 +4/10,0);
    body = [head,torso,arms,legs];
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    gl.useProgram( program );
    gl.cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );

    gl.vColor = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray( gl.vColor );

    gl.vBuffer = gl.createBuffer();
    gl.vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
    gl.enableVertexAttribArray( gl.vPosition );
    
    gl.lineWidth(3);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform3fv(thetaLoc, theta);
    body.map(function(section){
	section.map(function(part) {
	    part.render(gl);
	});
    });

    requestAnimFrame( render );
}

function handleKeyDown(evt){
    keycode = {
	37: function () {
	    axis = yAxis;
	    direction = 1;
	},
	38: function () {
	    axis = xAxis;
	    direction = 1;
	},
	39: function () {
	    axis = yAxis;
	    direction = -1;
	},
	40: function () {
	    axis = xAxis;
	    direction = -1;
	},
	87: function () {
	    axis = zAxis;
	    direction = 1;
	},
	83: function () {
	    axis = zAxis;
	    direction = -1;
	}
	};
    if(!(evt.shiftKey) && (evt.keyCode in keycode)){
	keycode[evt.keyCode]();
    }
    
};

window.addEventListener("keydown", handleKeyDown);


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
