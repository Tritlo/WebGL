//Sam.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
function Sam(descr){
    this.__proto__.setup("monkey.ply");
    this.setup(descr);
    this.rotate(Math.PI,[0,1,0]);
    this.origHeight = this.loc[1];
    this.currentTrans = [0,0,0,0];
    this.setColor(this.color || [0.0,1.0,0.0,1.0]);
    this.scale([0.3,0.3,0.3]);
    this.type = "Sam";
    this.moveQueue = [];
    this.rot = 0;
};

Sam.prototype = new Enemy();

Sam.prototype.onAnimEnd = function(loc){
    this.__proto__.onAnimEnd(loc);
    pyramid.unVisit(loc[0],loc[2]);
};


Sam.prototype.isDeadly = false;
Sam.prototype.waitTime = 200.0;
Sam.prototype.countDown = Sam.prototype.waitTime*Math.random();

