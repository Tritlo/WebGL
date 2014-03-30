//game.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
var canvas;
var gl;
var theta = [ 0, 0, 0 ];
var temptheta = [ 0, 0, 0 ];
var spin = [0,0,0];

var lowdef = false;
//var lowdef = true;
//var eye = vec3.create([0.0,0.0,2.0]);

var eye = vec3.create([6.0,6.0,6.0]);
var at = vec3.create([0.0,-2.0,0.0]);
var up = vec3.create([0.0,1.0,0.0]);

var lightPosition = vec4.create([5.0, 5.0, 5.0, 1.0] );
var lightAmbient =  vec4.create([0.5, 0.5, 0.5, 1.0  ]);
var lightDiffuse =  vec4.create([ 1.0, 1.0, 1.0, 1.0 ]);
var lightSpecular = vec4.create([ 1.0, 1.0, 1.0, 1.0 ]);

var materialAmbient =  vec4.create([ 0.5, 0.5, 0.5, 1.0 ]); 
var materialDiffuse =  vec4.create([ 0.4824, 0.5647, 0.5843, 1.0 ]);
var materialSpecular = vec4.create([  1, 1, 1, 1.0 ]);
var materialShininess = 100;



var ambientProduct,diffuseProduct,specularProduct;
var modelViewM;
var projectionM;

var shouldQuit = false;
var shouldUpdate = true;
var shouldSingleStep = false;

var pyramid;
var entityManager;
var tebert;
var plyReader = PlyReader();

var distFromEdgeOfScreen = 22;
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    window.onresize();
    
    //gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clearColor( 0.1, 0.3, 0.1, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = loadShaders( gl, "vshader.glsl" , "fshader.glsl" );
    
    gl.useProgram( program );
    //gl.cBuffer = gl.createBuffer();
    //gl.nBuffer = gl.createBuffer();
    //gl.vBuffer = gl.createBuffer();

    gl.vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vTex = gl.getAttribLocation( program, "vTexCoord" );
    gl.vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vColor = gl.getAttribLocation( program, "vColor" );
    gl.lightPos = gl.getUniformLocation(program, "lightPosition");
    
    if(gl.vColor && gl.vColor > 0){
	gl.enableVertexAttribArray( gl.vColor );
    }
    gl.enableVertexAttribArray( gl.vNormal );
    gl.enableVertexAttribArray( gl.vTex );
    gl.enableVertexAttribArray( gl.vPosition );

    //gl.tBuffer = gl.createBuffer();
    
    gl.lineWidth(3);

    gl.mVMLoc = gl.getUniformLocation(program, "modelViewMatrix");
    gl.pMLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.objMLoc = gl.getUniformLocation(program, "objectMatrix");
    gl.thetaLoc = gl.getUniformLocation(program, "theta");
    gl.shininess = gl.getUniformLocation(program, "shininess");


    ambientProduct =  vec4.mult(lightAmbient, materialAmbient);
    diffuseProduct =  vec4.mult(lightDiffuse, materialDiffuse);
    specularProduct = vec4.mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),ambientProduct );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),diffuseProduct );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),specularProduct );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),[eye[0],eye[1],eye[2],1]);
    
    //plyReader.read("teapot.ply",onModelReady);
    //plyReader.read("cube.ply",onModelReady);
    //cube = new Cube();
    //cube2 = new Cube();
    //plyReader.read("teapot-n.ply",onModelReady);
    //tebert = new Tebert({"loc":[0,1,0,1]});

    //tebert = new Tebert({"loc":[0,0.5,0,1], "color": [0.5,0.5,0.5,1.0]});
    pyramid = new Pyramid();
    entityManager.init();
    //ball = new Ball({"loc":[0,0.5,0,1], "color": [1.0,0.0,0.0,1.0]});
    entityManager.generateSam();
    entityManager.generateSnake();
    start();
};

function rotateTo(from,to){
    var sgnnext = [sign(to[0]),sign(to[2])];
    var prevRot = theta[0];
    var newRot = 0;
    //Ignore change on middle
    if(sgnnext[0] == 0 || sgnnext[1] == 0){
	return;
    }
    if(sgnnext[0] == 1 && sgnnext[1] == 1){
	newRot = 0;
    }
    if(sgnnext[0] == -1 && sgnnext[1] == 1){
	newRot = 45;
    }
    if(sgnnext[0] == -1 && sgnnext[1] == -1){
	newRot = 90;
    }
    if(sgnnext[0] == 1 && sgnnext[1] == -1){
	newRot =  135;
    }
   //theta[0] = newRot;
    startRotate(newRot);
};

var rotToAdd = 0;
var targetRot = 0;
function startRotate(newRot){
    targetRot = newRot;
    var diff = newRot - theta[0];
    var dir = sign(diff);
    var absdiff = Math.abs(diff);
    if(absdiff >  90 ){
	dir *= -1;
    }
    rotToAdd = dir*45/10;
    if(absdiff !== 90 && absdiff !== 45 && absdiff !== 135)
	theta[0] = newRot;
}

function start(){
    //tebert.translate([0.0,1.0,0.0]);
    //cube.scale([0.5,0.5,0.5]);
    //ball.scale([0.5,0.5,0.5]);
    //cube.translate([0,0,0]);
    //cube.swapColor();
    //cube.swapColor();
    //cube2.scale([0.5,0.5,0.5]);
    //cube2.swapColor();
    //cube2.translate([1,0,0]);
    window.requestAnimFrame(main);
};

function onVictory() {
    console.log('Victory!');
    pyramid = new Pyramid({height: pyramid.height+1});
    entityManager.getTebert().kill();
}

function onTebertDeath() {
    pyramid.reset();
    //pyramid = new Pyramid({height: pyramid.height});
}


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
    entityManager.update(du);
    //tebert.update(du);
    if(modulus(targetRot,180) != theta[0]){
	var nt = modulus(theta[0] + rotToAdd,180);
	theta[0] = nt;
   } else {
       rotToAdd = 0;
       targetRot = theta[0];
   }
}

function moveEye() {
    if (tebert.loc[0] * eye[0] < 0) eye[0] *= -1;
    if (tebert.loc[2] * eye[2] < 0) eye[2] *= -1;
};


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

var prevTrueTheta = vec3.create([NaN,NaN,NaN]);
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var trueTheta = vec3.add(theta,temptheta,vec3.create());
    if(trueTheta[0] !== prevTrueTheta[1] || trueTheta[1] !== prevTrueTheta[1])
    {
	var rotM = mat4.identity(mat4.create());
	mat4.rotate(rotM,-2*radians(trueTheta[0]),[0,1,0,0]);
	//mat4.rotate(rotM,-2*radians(clampRange(truetheta[1],0,12.25)),[1,0,0,0]);
	mat4.rotate(rotM,-2*radians(trueTheta[1]),[1,0,0,0]);
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
	modelViewM = mat4.lookAt(neye,at,up);
	prevTrueTheta = vec3.create(trueTheta);
	gl.uniform4fv( gl.lightPos,lp);
	gl.uniformMatrix4fv(gl.mVMLoc,false,modelViewM);
    }
    gl.uniformMatrix4fv(gl.pMLoc, false,projectionM);
    //Setjum sma perspective til ad gera thetta thaeginlegra
    //projectionM = mat4.perspective(45,canvas.width/canvas.height,0.1,100);

    //tebert.render(gl);
    pyramid.render(gl);
    entityManager.render(gl);

}

