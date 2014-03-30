//Snake.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
function Snake(descr){
    this.__proto__.setup("egret.ply");
    //this.__proto__.setup("monkey.ply");
    this.setColor([1.0,0.0,1.0,1.0]);
    this.setup(descr);
    this.rotate(-Math.PI/2,[1,0,0]);
    this.rotate(-Math.PI/2,[0,1,0]);
    this.translate([0,1.2,0]);
    this.origHeight = this.loc[1];
    this.currentTrans = [0,0,0,0];
    this.scale([0.2,0.2,0.2]);
    this.type = "Snake";
    this.moveQueue = [];
    this.rot = 0;
};

Snake.prototype = new Enemy();

Snake.prototype.waitTime = 100.0;
Snake.prototype.countDown = Snake.prototype.waitTime*Math.random();


Snake.prototype.getMove = function() {
    var move;
    var tebert = entityManager.getTebert();
    var dx = tebert.loc[0] - this.loc[0];
    var dz = tebert.loc[2] - this.loc[2];
    if (Math.abs(dx) > Math.abs(dz)) {
        if (dx > 0) move = [ 1, 0];
        else        move = [-1, 0];
    }
    else {
        if (dz > 0) move = [ 0, 1];
        else        move = [ 0,-1];
    }
    return move;
};
