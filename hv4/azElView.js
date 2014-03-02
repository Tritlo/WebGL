//azElView.js (C) 2014 Matthias Pall Gissurarson
var canvas;
var gl;


var cBuffer;
var vColor;
var vBuffer;
var vPosition;
var sun;

var modelViewM;
var projectionM;

var az = 0;
var el = 0;
var loc = [0,0,-10];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    sun = new Cube({
	"lColors": [
	    [1.0,0.0,0.0,1.0],
	    [1.0,0.0,0.0,1.0],
	    [0.0,1.0,0.0,1.0],
	    [0.0,1.0,0.0,1.0],
	    [0.0,0.0,1.0,1.0],
	    [0.0,0.0,1.0,1.0],
	    [1.0,1.0,0.0,1.0],
	    [1.0,1.0,0.0,1.0],
	    [0.0,1.0,1.0,1.0],
	    [0.0,1.0,1.0,1.0],
	    [1.0,0.0,1.0,1.0],
	    [1.0,0.0,1.0,1.0],
	    [1.0,1.0,1.0,1.0],
	    [1.0,1.0,1.0,1.0],
	    [0.5,0.5,0.5,1.0],
	    [0.5,0.5,0.5,1.0]
	]
    });
    
    sun.scale(5.0,5.0,5.0);
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

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

    gl.mVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.pMLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.objMLoc = gl.getUniformLocation(program, "objectMatrix");
    window.requestAnimFrame(render);
};



function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewM = AzElView(az,el,loc);
    //Setjum sma perspective til ad gera thetta thaeginlegra
    projectionM = perspective(45,canvas.width/canvas.height,100.0,0.1);
    gl.uniformMatrix4fv(gl.mVMLoc,false,flatten(modelViewM));
    gl.uniformMatrix4fv(gl.pMLoc,false,flatten(projectionM));
    sun.render(gl);
    window.requestAnimFrame(render);
}

function handleKeyDown(evt){
    keycode = {
	87: function () { //w
	    el += 1;
	},
	83: function () { //s
	    el -= 1;
	},
	65: function () { //a
	    az += 1;
	},
	68: function () { //d
	    az -= 1;
	},
	38: function () {
	    loc[2] += 0.1;
	},
	40: function () {
	    loc[2] -= 0.1;
	},
	37: function () {
	    loc[0] += 0.1;
	},
	39: function () {
	    loc[0] -= 0.1;
	},
	36: function () {
	    loc[1] += 0.1;
	},
	33: function () {
	    loc[1] -= 0.1;
	}
	};
    console.log(evt.keyCode);
    if(!(evt.shiftKey) && (evt.keyCode in keycode)){
	keycode[evt.keyCode]();
	console.log(el,az,loc);
    }
    
};

window.addEventListener("keydown", handleKeyDown);
