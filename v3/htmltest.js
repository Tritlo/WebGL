var canvas;
var gl;

var theta = [ 0, 0, 0 ];
var temptheta = [ 0, 0, 0 ];
var spin = [0,0,0];
var mouse = [0,0];
var orig = [0,0];
var mouseDown = false;

//var eye = vec3.create([0.0,0.0,2.0]);
var eye = vec3.create([0.0,0.0,4.0]);
var at = vec3.create([0.0,0.0,0.0]);
var up = vec3.create([0.0,1.0,0.0]);

var lightPosition = vec4.create([1.0, 1.0, 2.0, 1.0] );
var lightAmbient =  vec4.create([0.2, 0.2, 0.2, 1.0  ]);
var lightDiffuse =  vec4.create([ 0.5, 0.50, 0.50, 1.0 ]);
var lightSpecular = vec4.create([ 1.0, 1.0, 1.0, 1.0 ]);

var materialAmbient =  vec4.create([ 0.2, 0.28, 0.29, 1.0 ]); 
var materialDiffuse =  vec4.create([ 0.4824, 0.5647, 0.5843, 1.0 ]);
var materialSpecular = vec4.create([  1, 1, 1, 1.0 ]);
var materialShininess = 10000.0;




var ambientProduct,diffuseProduct,specularProduct;
var modelViewM;
var projectionM;
var shouldQuit = false;
var shouldUpdate = false;
var shouldSingleStep = false;
var mod;
var plyReader = PlyReader();
window.onload = function init() {

    ambientProduct =  vec4.mult(lightAmbient, materialAmbient);
    diffuseProduct =  vec4.mult(lightDiffuse, materialDiffuse);
    specularProduct = vec4.mult(lightSpecular, materialSpecular);
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    
    gl.useProgram( program );
    gl.cBuffer = gl.createBuffer();
    gl.nBuffer = gl.createBuffer();
    gl.vBuffer = gl.createBuffer();

    gl.vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vTex = gl.getAttribLocation( program, "vTexCoord" );
    gl.vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vColor = gl.getAttribLocation( program, "vColor" );
    console.log(gl.vNormal,gl.vColor,gl.vPosition,gl.vTex);
    gl.lightPos = gl.getUniformLocation(program, "lightPosition");
    
    if(gl.vColor && gl.vColor > 0){
	gl.enableVertexAttribArray( gl.vColor );
    }
    gl.enableVertexAttribArray( gl.vNormal );
    gl.enableVertexAttribArray( gl.vPosition );

    /*
    gl.tBuffer = gl.createBuffer();
    //gl.bindBuffer( gl.ARRAY_BUFFER, gl.tBuffer );
    gl.enableVertexAttribArray( gl.vTex );
    */
    
    gl.lineWidth(3);

    gl.mVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.pMLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.objMLoc = gl.getUniformLocation(program, "objectMatrix");
    gl.thetaLoc = gl.getUniformLocation(program, "theta");

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),specularProduct );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),[eye[0],eye[1],eye[2],1]);
    
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
    
    //plyReader.read("teapot.ply",onModelReady);
    plyReader.read("monkey.ply",onModelReady);
    //plyReader.read("cube.ply",onModelReady);
};

function onModelReady(mel){
    mod = mel;
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

var prevTrueTheta = vec3.create([0,0,0]);
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var rotM = mat4.identity(mat4.create());
    var truetheta = vec3.add(theta,temptheta,vec3.create());
    mat4.rotate(rotM,-2*radians(truetheta[0]),[0,1,0,0]);
    mat4.rotate(rotM,-2*radians(truetheta[1]),[1,0,0,0]);
    var neye = vec4.create(eye);
    neye[3] = 1;
    neye = mat4.multiplyVec3(rotM,neye);
    neye = vec3.create(neye);
    if(neye[0] === 0 && neye[1] !== 0 && neye[2] === 0){
	neye[2] = 0.01;
    }
    var lp = vec4.create(neye);
    //var lp = vec4.negate(lp);
    lp[3] = 1;
    gl.uniform4fv( gl.lightPos,lp);
    modelViewM = mat4.lookAt(neye,at,up);
    //Setjum sma perspective til ad gera thetta thaeginlegra
    projectionM = mat4.perspective(45,canvas.width/canvas.height,0.1,100);
    gl.uniformMatrix4fv(gl.mVMLoc,false,modelViewM);
    gl.uniformMatrix4fv(gl.pMLoc, false,projectionM);

    mod.render(gl);
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




function handleMouse(evt,type) {

    if(type === "scroll"){
	eye[2] -= sign(evt.wheelDelta);
    };
    var rect = canvas.getBoundingClientRect();
    var pos = [rect.left,rect.top];
    if(type == "up"){
	mouseDown = false;
	var x =  mouse[0]-orig[0];
	var y =  mouse[1]-orig[1];
	theta[0] += x/2;
	//var truex = theta[0];
	//var cosx = Math.cos(truex);
	//var sinx = Math.sin(truex);
	theta[1] += y/2;
	//theta[2] += sinx*y;
	theta = angleBound(theta);
	theta.splice(3,1);
	temptheta = [0,0,0];
    }
    if(type==="down") {
	mouseDown = true;
	mouse = [evt.clientX - pos[0]-256,evt.clientY - pos[1]-256];
	orig = [mouse[0],mouse[1]];
	}
    if(type === "move"){
	if (mouseDown){
	    mouse = [evt.clientX - pos[0]-256,evt.clientY - pos[1]-256];
	    var x =  mouse[0]-orig[0];
	    var y =  mouse[1]-orig[1];
	    temptheta[0] = x/2;
	    //var truex = theta[0] + x;
	    //var cosx = Math.cos(truex);
	    //var sinx = Math.sin(truex);
	    temptheta[1] = y/2;
	    //temptheta[2] = sinx*y;
	}
    }
}


function handleMouseScroll(evt) {handleMouse(evt,"scroll");};
function handleMouseDown(evt) {handleMouse(evt,"down");};
function handleMouseMove(evt) {handleMouse(evt,"move");};
function handleMouseUp(evt) {handleMouse(evt,"up");};

window.addEventListener("mouseup", handleMouseUp);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mousewheel", handleMouseScroll);
