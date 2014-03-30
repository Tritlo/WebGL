//Tebert.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
function Tebert(descr){
    var modelFile = (lowdef) ? "monkey.ply" : "head.ply";
    //var d = plyReader.getData(modelFile);
    this.__proto__.setup(modelFile);
    this.textureSrc = "fur.png";
    descr.shininess = 4;
    this.setup(descr);
    this.rotate(Math.PI,[0,1,0]);
    this.origHeight = this.loc[1];
    this.currentTrans = [0,0,0,0];
    this.setColor(descr.color || [0.2,0.2,0.2,1.0]);
    this.scale([0.35,0.35,0.35]);
    this.type = "Tebert";
    this.moveQueue = [];
    this.rot = 0;
};

Tebert.prototype = new Character();
Tebert.prototype.onAnimStart = function(currloc,nextloc){
    rotateTo(currloc,nextloc);
};

Tebert.prototype.kill = function() {
    //console.log('DEAD');
    this.moveQueue = [];
    this.addMove([-this.loc[0], -this.loc[2]]);
    onTebertDeath();
};

Tebert.prototype.onAnimEnd = function(currloc,prevloc){
    pyramid.visit(currloc[0],currloc[2]);
    if (pyramid.hasWon()) onVictory();
    entityManager.checkCollisions();
    // moveEye();
    entityManager.killOutOfBounds();
};

Tebert.prototype.keys = function(keyPressed){
    var tb = this;
    var keys = {
	"i": function(){
	    if(tb.rot === 0)
		return [0,-1];
	    if(tb.rot === -Math.PI/2)
		return [1,0];
	    if(tb.rot === Math.PI/2)
		return [-1,0];
	    if(tb.rot === Math.PI)
		return [0,1];
	},
	"j": function(){
	    if(tb.rot === 0)
		return [-1,0];
	    if(tb.rot === -Math.PI/2)
		return [0,-1];
	    if(tb.rot === Math.PI/2)
		return [0,1];
	    if(tb.rot === Math.PI)
		return [1,0];
	},
	"k": function(){
	    if(tb.rot === 0)
		return [0,1];
	    if(tb.rot === -Math.PI/2)
		return [-1,0];
	    if(tb.rot === Math.PI/2)
		return [1,0];
	    if(tb.rot === Math.PI)
		return [0,-1];
	},
	"l": function(){
	    if(tb.rot === 0)
		return [1,0];
	    if(tb.rot === -Math.PI/2)
		return [0,1];
	    if(tb.rot === Math.PI/2)
		return [0,-1];
	    if(tb.rot === Math.PI)
		return [-1,0];

	}
    };
    

    var move = keys[keyPressed]();
    this.addMove(move);
};
