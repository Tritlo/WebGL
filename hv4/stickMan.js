//stickMan.js (C) 2014 Matthias Pall Gissurarson
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
var body = [];


var eye = vec3(-0.4,0.6,-1.6);
var at = vec3(0.0,0.4,0.0);
var up = vec3(0.0,1.0,0.0);
var modelViewM, mVMLoc;
var projectionM, pMLoc;

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
    var c = new Cube();
    c.translate(0.5,0.5,0.5);
    c.renderLines = false;
    body = [head,torso,arms,legs,[c]];

    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
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

    mVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    pMLoc = gl.getUniformLocation(program, "projectionMatrix");
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewM = lookAt(eye,at,up);
    //Setjum sma perspective til ad gera thetta thaeginlegra
    projectionM = perspective(45,1,100.0,0.1);
    gl.uniformMatrix4fv(mVMLoc,false,flatten(modelViewM));
    gl.uniformMatrix4fv(pMLoc,false,flatten(projectionM));
    body.map(function(section){
	section.map(function(part) {
	    part.render(gl);
	});
    });

    requestAnimFrame( render );
}

function handleKeyDown(evt){
    keycode = {
	87: function () { //w
	    eye[2] += 0.1;
	},
	83: function () { //s
	    eye[2] -= 0.1;
	},
	65: function () { //a
	    eye[0] += 0.1;
	},
	68: function () { //d
	    eye[0] -= 0.1;
	},
	38: function () {
	    eye[1] += 0.1;
	},
	40: function () {
	    eye[1] -= 0.1;
	}
	};
    if(!(evt.shiftKey) && (evt.keyCode in keycode)){
	keycode[evt.keyCode]();
    }
    
};

window.addEventListener("keydown", handleKeyDown);
