function Character(descr){
    this.setup(descr);
};

Character.prototype = new Model();

Character.prototype.isDead = false;
Character.prototype.availableMoves = [[1,0],[0,1],[-1,0],[0,-1]];


Character.prototype.move = function(move,noAnimation){
    var currLoc = this.loc;
    var trans = [move[0],0,move[1],0];
    var currH = this.loc[1];
    var newH =
	    - Math.abs(move[0]+this.loc[0])
	    - Math.abs(move[1]+this.loc[2]);
    var diff = newH - currH + this.origHeight;
    
    trans[1] = diff;
    trans[3] = 0;
    if(!noAnimation){
	this.setRot(this.getRot(move));
	this.startAnim(trans);
    } else {
	this.translate(trans);
    }
};

Character.prototype.setRot = function(newRot){
    var diff = newRot - this.rot;
    this.rotate(diff,[0,1,0]);
    this.rot = newRot;
};

Character.prototype.getRot = function(move){
    if(move[0] === 1 )
	return -Math.PI/2;
    if(move[0] === -1 )
	return Math.PI/2;
    if(move[1] === 1 )
	return Math.PI;
    return 0;
}

Character.prototype.isLegal = function(move){
  var dNext = manhattanDist(this.loc[0]+move[0] ,this.loc[2]+move[1]);
  return dNext < pyramid.height -1;
};

Character.prototype.getLegalMoves = function(){
   var legalMoves = [];
   for(var m in this.availableMoves)
       if(this.isLegal(this.availableMoves[m]))
	   legalMoves.push(this.availableMoves[m].slice(0));
   return legalMoves;
};

Character.prototype.onAnimEnd = function(currloc,nextloc){
    //Callback on anim end
};
Character.prototype.onAnimStart = function(currloc,prevloc){
    //Callback on anim start
};

Character.prototype.update = function(du){
    if(this.animating) this.animate();
    else {
	if(this.moveQueue.length !== 0){
	    this.move(this.moveQueue.shift());
	}
    }
};


Character.prototype.addMove = function(trans){
    this.moveQueue.push(trans);
};


Character.prototype.startAnim = function(trans){
    this.currTransParts = 0;
    this.animParts = this.animSpeed || 10;
    this.currentTrans = trans;

    this.transPart = vec4.scale(trans, 2/this.animParts, vec4.create());
    if(this.transPart[1] > 0){
	this.transPart[0] = 0;
	this.transPart[2] = 0;
    } else {
	this.transPart[1] = 0;
    }

    this.animating = true;
    this.onAnimStart(vec4.round(this.loc),vec4.round(
	vec4.add(this.loc,trans,vec4.create())));
};

Character.prototype.halfAnim = function(){
    this.transPart = vec4.scale(this.currentTrans, 2/this.animParts, vec4.create());
    if(this.transPart[1] < 0){
	this.transPart[0] = 0;
	this.transPart[2] = 0;
    } else {
	this.transPart[1] = 0;
    }
};

Character.prototype.endAnim = function(){
    this.animating = false;
    this.onAnimEnd(vec4.round(this.loc),vec4.round(
	vec4.subtract(this.loc,this.currentTrans,vec4.create())));
    //Models get placed in wrong spots!
    //this.loc = this.loc.map(Math.round);
    this.currentTrans = [0,0,0,0];
    this.transPart = [0,0,0,0];
};

Character.prototype.animate = function(){
    if(this.currTransParts < this.animParts){
	this.translate(this.transPart);
	this.currTransParts +=1;
    } else {
	this.endAnim();
    }
    
    if(this.currTransParts === this.animParts/2){
	this.halfAnim();
    }
};
