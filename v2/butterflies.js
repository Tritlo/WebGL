//butterflies.js (C) 2014 Matthias Pall Gissurarson
var canvas;
var gl;


var cBuffer;
var vColor;
var vBuffer;
var vPosition;
var butterflies;

var eye = vec3(0.1,5.0,20.0);
var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,1.0,0.0);
var modelViewM;
var projectionM;
var shouldQuit = false;
var shouldUpdate = false;
var shouldSingleStep = false;

var colors = [
[1.0,0.0,0.0,1.0],
[1.0,1.0,0.0,1.0],
[1.0,0.0,1.0,1.0],
[0.0,1.0,0.0,1.0],
[0.0,1.0,0.0,1.0],
[0.0,1.0,1.0,1.0],
[0.0,0.0,1.0,1.0]
];

function randomButterfly(insize,inspeed){

    var size = insize || 1;
    var speed  = 1;
    if (inspeed !== undefined){
	speed = inspeed;
    }


    var ulcol = colors[Math.floor(Math.random()*colors.length)];
    var llcol = colors[Math.floor(Math.random()*colors.length)];
    var vel = [1-2*Math.random(),1-2*Math.random(),1-2*Math.random(),0];
    if (length(vel) != 0)
	vel = normalize(vel);
    vel = scale(speed,vel);
    return new Butterfly({
	"ulcols" : [ulcol],
	"llcols" : [llcol],
	"urcols" : [llcol],
	"lrcols" : [ulcol],
	"size" : size,
	"startLoc": [3-6*Math.random(),3-6*Math.random(),3-6*Math.random(),1],
	"startVel": vel,
	"flapSpeed":  Math.random()*5 + 2
    });


};

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    butterflies = [];
    for(var b = 0; b < 20; b++){
	//butterflies.push(randomButterfly(0.2,5));
    };
    var ulcol = colors[3];
    var llcol = colors[6];
    butterflies.push(
	new Butterfly({
	    /*
	    "ulcols" : [ulcol],
	    "llcols" : [llcol],
	    "urcols" : [llcol],
	    "lrcols" : [ulcol],
	     */
	    "color" : [[1,1,1,1]],
	    "startVel" : [0,0,0.0,0],
	    "flapSpeed" : 5,
	    "size" : 1
	    }));

    b = butterflies[0];
    //b.direct([1,0,0,0]);
    //b.orient([0,1,0,0]);
    //b.direct([1,0.4,0,0]);
    console.log(b.direction,b.normal);
    gl.viewport( 0, 0, canvas.width, canvas.height );
    //gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
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

    gl.mVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.pMLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.objMLoc = gl.getUniformLocation(program, "objectMatrix");
    window.requestAnimFrame(main);
};


var NOMINAL_UPDATE_INTERVAL = 16.666;
function update(dt) {
    var original_dt = dt;
    // Warn about very large dt values -- they may lead to error
    //
    if (dt > 200) {
        console.log("Big dt =", dt, ": CLAMPING TO NOMINAL");
        dt = NOMINAL_UPDATE_INTERVAL;
    }
    // If using variable time, divide the actual delta by the "nominal" rate,
    
    // giving us a conveniently scaled "du" to work with.
    //
    var du = (dt / NOMINAL_UPDATE_INTERVAL);

    butterflies.map(function(b) {b.update(du/100);});

}

var lastUpdate = 0;

function main(currTime){
    var thisUpdate = currTime;
    if (shouldUpdate)
	update(thisUpdate-lastUpdate);
    if(shouldSingleStep){
	update(thisUpdate-lastUpdate);
	shouldSingleStep = false;
	}
    
    render();
    if (! shouldQuit)
	window.requestAnimFrame(main);
    lastUpdate = thisUpdate;
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    modelViewM = lookAt(eye,at,up);
    //Setjum sma perspective til ad gera thetta thaeginlegra
    projectionM = perspective(45,canvas.width/canvas.height,100.0,0.1);

    
    gl.uniformMatrix4fv(gl.mVMLoc,false,flatten(modelViewM));
    gl.uniformMatrix4fv(gl.pMLoc,false,flatten(projectionM));
    
    butterflies.map(function (body){body.render(gl);});
    /*
    //Lika haegt ad gera svona:
    //Meira efficient, en ekki alveg jafn hentugt
    gl.uniformMatrix4fv(gl.objMLoc,false,flatten(mat4()));
    solarSystem.map(function (body){body.updateVertices();});
    var lineVertices = solarSystem.map(function(body){return body.lineVertices;});
    var lineColors = solarSystem.map(function(body){return body.lineColors;});
    var lV = [];
    for(var i = 0; i < lineVertices.length;i++){
	lV = lV.concat(lineVertices[i]);
    }
    var lC = [];
    for(var i = 0; i < lineColors.length;i++){
	lC = lC.concat(lineColors[i]);
    }
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(lC)), gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vColor, 4, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, gl.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(lV), gl.STATIC_DRAW );
    gl.vertexAttribPointer( gl.vPosition, 4, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.LINES, 0, lV.length );
    */
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
	38: function () {//<-
	    eye[1] += 0.1;
	},
	40: function () {//->
	    eye[1] -= 0.1;
	},
	81: function (){//q
	    shouldQuit = true;
	},
	69: function(){//e
	    shouldUpdate = !shouldUpdate;
	},
	82: function(){//r
	    shouldSingleStep=true;
	}
	
	};
    //console.log(evt.keyCode);
    if(!(evt.shiftKey) && (evt.keyCode in keycode)){
	keycode[evt.keyCode]();
    }
    
};

window.addEventListener("keydown", handleKeyDown);
