//Enemy.js (C) 2014 Matthias Pall Gissurarson, Vilhjalmur Vilhjalmsson
function Enemy(descr){
    this.setup(descr);
};


Enemy.prototype = new Character();

Enemy.prototype.update = function(du) {
    Character.prototype.update.call(this,du);
    this.countDown -= du;
    if (this.countDown < 0 && !this.animating) {
        this.countDown = this.waitTime-(this.waitTime/5)*Math.random();
        var move = this.getMove();
        this.addMove(move);
    }

    if (this.isDead) return entityManager.KILL_ME_NOW;
    
};


Enemy.prototype.isDeadly = true;

Enemy.prototype.kill = function() {
    this.isDead = true;
};

Enemy.prototype.getMove = function() {
    var legalMoves = this.getLegalMoves();
    var rand = randInt(0,legalMoves.length);
    return legalMoves[rand];
};

Enemy.prototype.onAnimEnd = function(loc){
    entityManager.checkCollisions();
    entityManager.killOutOfBounds();
};
