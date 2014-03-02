// Copyright (c) 2013 Matthías Páll Gissurarson
// MIT Licensed. 
var canvas;
var gl, program;
var posBuffer, colorBuffer;
var mouse = [0,0];
var lastUpdate;
var points;
var gameOver = false;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "shaders/vshader.glsl", "shaders/fshader.glsl" );
    gl.useProgram( program );
    gl.program = program;
    
    // Load the data into the GPU
    gl.program.vPos = gl.getAttribLocation( gl.program, "vPosition" );
    gl.enableVertexAttribArray(gl.program.vPos);

    gl.program.vCol = gl.getAttribLocation(gl.program,"vertColor");
    gl.enableVertexAttribArray(gl.program.vCol);
    
    posBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, posBuffer );

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffer);
    entityManager.init();
    points = new Points();
    window.requestAnimFrame(main);
    
};


var entityManager = {
    _entities: [],
    _nextId: 0,
    addEntity: function (entity){
	entity._id = this._nextId++;
	this._entities.push(entity);
    },
    killFrom: function(bullet){
	var loc = bullet.loc;
	var w = bullet.width;
	var h = bullet.height;
	var rad = w > h? w : h;
	var hb = bullet.hitBox;
	var hit = false;
	for(var i = 0; i < this._entities.length; ++i){
	    var e = this._entities[i];
	    var w = e.width;
	    var h = e.height;
	    var erad = w > h? w : h;
	    var ehb = e.hitBox;
	    if((e._id !== bullet._id) && e.canDie){
		var dist = distSq(loc,e.loc);
		var rads =  sq(rad+erad);
		if (  dist <= rads){
			if(ehb && boxInBox(ehb[1],ehb[2],hb[1],hb[2])){
			    e.isDead = true;
			    hit = true;
			    entityManager.numBirds--;
			    points.add(1);
			}
		    }
	    }
	}
	return hit;
    },
    render: function (ctx){
	this._entities.map(function(e) {e.render(ctx);});
    },
    numBirds: 0,
    update: function(du){
	this._entities.map(function(e) {
	    return e.update(du);
	});
	this._entities = this._entities.filter(function (e) {return !(e.isDead);});
	if(points.val >= 5){
	    gameOver = true;
	}
	if(this.numBirds < 2){
	    var rand = Math.random()*2;
	    for( var i = 0; i < rand; i++){
		this.addEntity(new Bird());
		this.numBirds++;
	    }
	}

    },
    getGun: function(){
	return this._entities[0];
    },
    init : function(){
	this.addEntity(new Gun({"loc":[15,15]}));
	this.addEntity(new Bird());
	this.numBirds++;
    }
};

function between(x,a,b){
    var res = (a <= x && x <= b);
    return res;
};

function sq(x){ return x*x;};
function distSq(x, y) {
    return sq(y[0]-x[0]) + sq(y[1]-x[1]);
};

function boxInBox(tlc1,brc1,topLeftCorner,bottomRightCorner){
    var TLC = topLeftCorner;
    var BRC = bottomRightCorner;
    var eTLC = tlc1;
    var eBRC = brc1;
    return ( !(eBRC[1] > TLC[1]) && !(eTLC[1] < BRC[1]) &&
         !(eBRC[0] < TLC[0]) && !(eTLC[0] > BRC[0]));
};

function normalizePos(pos){
    var w = canvas.width;
    var h = canvas.height;
    return [2*(pos[0]/w) -1,2*(pos[1]/h) - 1];

};


function handleMouse(evt,type) {
    var rect = canvas.getBoundingClientRect();
    var pos = [rect.left,rect.top];
    mouse = [evt.clientX - pos[0],evt.clientY - pos[1]];
    if(type==="down") {
	if(evt.which === 1){
	    entityManager.getGun().shouldFire = true;
	} else {
	    entityManager.addEntity(new Bird());
	}
	    }
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
}


function main(currTime){
    var thisUpdate = currTime;
    update(thisUpdate-lastUpdate);
    entityManager.render(gl);
    points.render(gl);
    if(!gameOver){
	window.requestAnimFrame(main);
	} else {
	    gameOver();
	}
    lastUpdate = thisUpdate;
};

function handleMouseDown(evt) {handleMouse(evt,"down");};
function handleMouseMove(evt) {handleMouse(evt,"move");};

window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
