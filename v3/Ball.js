function Ball(descr){
    var modelFile = (lowdef) ? "sphere.ply" : "newsphere.ply";
    this.__proto__.setup(modelFile);
    descr.shininess = 200;
    this.setup(descr);
    //this.rotate(Math.PI,[0,1,0]);
    this.origHeight = this.loc[1];
    this.currentTrans = [0,0,0,0];
    //this.setColor(descr.color || [0.85,0.64,0.13,1.0]);
    this.setColor(descr.color || [1.0,0.0,0.0,1.0]);
    //this.scale([0.8,0.8,0.8]);
    this.scale([0.48,0.48,0.48]);
    this.type = "Ball";
    this.moveQueue = [];
    this.rot = 0;
};

Ball.prototype = new Enemy();


Ball.prototype.waitTime = 50.0;
Ball.prototype.countDown = Ball.prototype.waitTime*Math.random();

Ball.prototype.isLegal = function(move){
    var dNow = manhattanDist(this.loc[0],this.loc[2]);
    var dNext = manhattanDist(this.loc[0]+move[0],this.loc[2]+move[1]);
    return (dNow < dNext);
};
