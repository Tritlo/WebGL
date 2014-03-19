
//butterflies.js (C) 2014 Matthias Pall Gissurarson
var canvas;
var gl;

var theta = [ 0, 0, 0 ];
var temptheta = [ 0, 0, 0 ];
var spin = [0,0,0];
var mouse = [0,0];
var orig = [0,0];
var mouseDown = false;

var cBuffer;
var vColor;
var vBuffer;
var vPosition;
var butterflies;

var eye = vec3(0.0,0.0,60.0);
var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,1.0,0.0);
var modelViewM;
var projectionM;
var shouldQuit = false;
var shouldUpdate = false;
var shouldSingleStep = false;
var rot = [0,0,0,0];
var cube;
var colors = [
[1.0,0.0,0.0,1.0],
[1.0,1.0,0.0,1.0],
[1.0,0.0,1.0,1.0],
[0.0,1.0,0.0,1.0],
[0.0,1.0,0.0,1.0],
[0.0,1.0,1.0,1.0],
[0.0,0.0,1.0,1.0]
];

var flock = true;
var maxdist = 30;
var mindist = 0.5; 
var maxangl =  90;
var limit = [20,20,20];
var sepfactor = 0.2;
var alignfactor = 0.45;
var cohefactor = 0.8;
var initsize = 0.2;
var initspeed = 6/100.0;

function randomButterfly(insize,inspeed){

    var size = insize || 1;
    var speed  = inspeed || 1;
    if (inspeed !== undefined){
	speed = inspeed;
    }


    var ulcol = colors[Math.floor(Math.random()*colors.length)];
    var llcol = colors[Math.floor(Math.random()*colors.length)];
    var dir = [1-2*Math.random(),1-2*Math.random(),1-2*Math.random(),0];
    dir = normalize(dir);
    return new Butterfly({
	"ulcols" : [ulcol],
	"llcols" : [llcol],
	"urcols" : [llcol],
	"lrcols" : [ulcol],
	"size" : size,
	"startLoc": [(limit[0]-2*limit[0]*Math.random())/2,(limit[1]-2*limit[1]*Math.random())/2,(limit[2]-2*limit[2]*Math.random())/2,1],
	"startDir": dir,
	"startSpeed" : inspeed*Math.random()*2 +inspeed,
	"flapSpeed":  Math.random()*10 +5,
	"decisionTime": Math.random()*10+2,
	"startAngle": 45-90*Math.random()
    });


};

var first;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    cube = new Cube();
    cube.scale(limit[0]*2,limit[1]*2,limit[2]*2);
    butterflies = [];
    for(var b = 0; b < 50; b++){
	var nb = randomButterfly(initsize,initspeed);
	butterflies.push(nb);
    };
    
    first = butterflies[0];
    var ulcol = colors[3];
    var llcol = colors[6];

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
    gl.thetaLoc = gl.getUniformLocation(program, "theta"); 
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

    var newDirs = [];
    for(var b in butterflies){
	newDirs.push(flockDir(b));
    }
    for(var ind in butterflies){
	var b = butterflies[ind];
	var newLoc = b.loc.slice(0);
	for(var i in b.loc){
	    if(Math.abs(b.loc[i])+2*b.size > limit[i]){
		newLoc[i] = -1*sign(newLoc[i])*(limit[i] - 2*b.size - 0.1);
	    }
	};
	b.translate(negate(b.loc));
	b.translate(newLoc);
	if(newDirs[ind]){
	    var nd = newDirs[ind];
	    var od = b.dir;
	    //b.direct(newDirs[ind]);
	    b.direct(scale(0.5,add(nd,od)));
	    b.speed = ((initspeed*Math.random()*4)+b.speed)/2;
	    b.flapSpeed = b.speed*100;
	}
	b.update(du);
    }

}

function flockDir(butterflyIndex){
    var b = butterflies[butterflyIndex];
    var p = b.loc;
    if(b.timeSinceLastDirect <= b.decisionTime){
	return false;
    };
    var inrange = [];
    for(var i in butterflies){
	if(i === butterflyIndex)
	    continue;
	var b2 = butterflies[i];
	var los = add(p,negate(b2.loc));
	var d = length(los);
	var b2dir = normalize(los);
	var dir = b.dir.slice(0);
	dir.splice(3,1);
	b2dir.splice(3,1);
	dir.splice(0,1);
	b2dir.splice(0,1);
	var cos= dot(b2dir,dir);
	//var sin = length(cross(b2dir,dir));
	var angl1 = Math.abs(Math.acos(cos)*180/Math.PI);
	var b2dir = normalize(los);
	var dir = b.dir.slice(0);
	dir.splice(3,1);
	b2dir.splice(3,1);
	dir.splice(1,1);
	b2dir.splice(1,1);
	var cos= dot(b2dir,dir);
	var angl2 = Math.abs(Math.acos(cos)*180/Math.PI);
	if (d < maxdist && angl1 < maxangl && angl2 < maxangl){
	    inrange.push(i);
	}

    };
    if(inrange.length > 0){
	var avgloc = vec4(0,0,0,0);
	var avgdir = vec4(0,0,0,0);
	var toocloseLoc = vec4(0,0,0,1);
	var tooclose = 0;
	for(var i in inrange){
	    var but = butterflies[inrange[i]];
	    var los = add(p,negate(but.loc));
	    var d = length(los);
	    avgloc = add(avgloc,but.loc);
	    avgdir = add(avgdir,but.dir);
	    if(d < mindist){
		toocloseLoc = add(toocloseLoc,but.loc);
		tooclose += 1;
	    };
	};
	var N = 1.0*inrange.length;
	avgloc = scale(1/N,avgloc);
	var toavg = add(avgloc,negate(p));
	avgdir = scale(1/N,avgdir);
	if(tooclose > 0){
	    toocloseLoc = scale(1/(1.0*tooclose),toocloseLoc);
	}
	var fromtooclose = add(p,negate(toocloseLoc));
	var newDir = add(scale(cohefactor,toavg),scale(alignfactor,avgdir));
	newDir = add(newDir,scale(sepfactor,fromtooclose));
	newDir = normalize(newDir);
	return newDir;
    };
    return false;
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

var prevTrueTheta = [0,0,0];
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var rotM = mat4();
    var truetheta = add(theta,temptheta);
    rotM = mult(rotate(truetheta[1],[1,0,0,0]),rotM);
    if(!equal(truetheta,prevTrueTheta)){
	prevTrueTheta = truetheta;
	console.log(flatten(rotM));
    }
    rotM = mult(rotate(truetheta[0],[0,1,0,0]),rotM);
    //rotM = mult(rotate(truetheta[2],[0,0,1,0]),rotM);
    var neye = eye.slice(0);
    neye[3] = 1;
    neye = mulMV(rotM,neye);
    neye.splice(3,1);
    if(neye[0] === 0 && neye[1] !== 0 && neye[2] === 0){
	neye[2] = 0.01;
    }
    /*
    if(!equal(truetheta,prevTrueTheta)){
	prevTrueTheta = truetheta;
	console.log("rotm");
	console.log(flatten(rotM));
	console.log("tt");
	console.log(truetheta);
	console.log("e");
	console.log(eye);
	console.log("ne");
	console.log(neye);
    };
     */
    modelViewM = lookAt(neye,at,up);
    //Setjum sma perspective til ad gera thetta thaeginlegra
    projectionM = perspective(45,canvas.width/canvas.height,100.0,0.1);
    
    gl.uniformMatrix4fv(gl.mVMLoc,false,flatten(modelViewM));
    gl.uniformMatrix4fv(gl.pMLoc,false,flatten(projectionM));
    
    butterflies.map(function (body){body.render(gl);});
    cube.render(gl);
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

document.addEventListener('DOMContentLoaded', function(){
  document.getElementById("alignnum").innerHTML = alignfactor;
  document.getElementById("sepnum").innerHTML = sepfactor;
  document.getElementById("cohenum").innerHTML = cohefactor;
  document.getElementById("align").value = alignfactor;
  document.getElementById("sep").value = sepfactor;
  document.getElementById("cohe").value = cohefactor;
    
document.getElementById("align").onchange=function(e){
  alignfactor = parseFloat(this.value);
  document.getElementById("alignnum").innerHTML = alignfactor;
};
document.getElementById("sep").onchange=function(e){
  sepfactor = parseFloat(this.value);
  document.getElementById("sepnum").innerHTML = sepfactor;
};
document.getElementById("cohe").onchange=function(e){
  cohefactor = parseFloat(this.value);
  document.getElementById("cohenum").innerHTML = cohefactor;
};
document.getElementById("addb").onclick=function(e){
    addbutterf();
};
document.getElementById("pause").onclick=function(e){
    shouldUpdate = !shouldUpdate;
};

});

function addbutterf(){
    console.log("adding butterfly");
    butterflies.push(randomButterfly(initsize,initspeed));
};


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
	theta[0] += x;
	//var truex = theta[0];
	//var cosx = Math.cos(truex);
	//var sinx = Math.sin(truex);
	theta[1] += y;
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
	    temptheta[0] = x;
	    //var truex = theta[0] + x;
	    //var cosx = Math.cos(truex);
	    //var sinx = Math.sin(truex);
	    temptheta[1] = y;
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
