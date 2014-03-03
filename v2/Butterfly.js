function Butterfly(descr){
    this.loc = [0,0,0,1.0];
    this.rot = [0,0,0,0];
    this.dir = [0,1,0,0];
    this.speed = 1;
    this.wingAngle = 0;
    this.flapDir = 1;
    this.flapSpeed = 10;
    this.size=1;
    this.timeSinceLastDirect = Infinity;
    this.decisionTime = 5;
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    this.init();
}



Butterfly.prototype.init = function (){
    var s = this.size;
    var upperleft = new Cube({"vColors": this.ulcols || this.color});
    upperleft.scale(s*1.0,s*1.0,s*0.2);
    var lowerleft = new Cube({"vColors": this.llcols || this.color});
    lowerleft.scale(s*1.5,s*1.5,s*0.2);
    
    var upperright = new Cube({"vColors": this.urcols || this.ulcols || this.color});
    upperright.scale(s*1.0,s*1.0,s*0.2);
    var lowerright = new Cube({"vColors": this.lrcols || this.llcols || this.color});
    lowerright.scale(s*1.5,s*1.5,s*0.2);

    upperleft.translate(-0.6 *s,-0.60*s,0);
    upperright.translate(0.6 *s,-0.60*s,0);
    lowerleft.translate(-0.85*s, 0.85*s,0);
    lowerright.translate(0.85*s, 0.85*s,0);
    
    

    this.wings = [upperleft,lowerleft,upperright,lowerright];
    //this.direct([0,0,1,0]);
    if(this.startDir){
	this.direct(this.startDir);
    }
    if(this.startLoc)
	this.translate(this.startLoc);
    if(this.startSpeed !== undefined)
	this.speed = this.startSpeed;
    if(this.startAngle)
	this.setWingAngle(this.startAngle);

};

Butterfly.prototype.update = function(du){
    this.timeSinceLastDirect += du;
    this.updateWings(du);
    this.translate(scale(du*this.speed,this.dir));
};

Butterfly.prototype.translate = function(vec){
    for(var part in this.wings){
	this.wings[part].translate(vec);
    }
    this.loc = add(this.loc,vec);
    this.loc[3] = 1;
};



Butterfly.prototype.updateWings = function(du){
    if (Math.abs(this.wingAngle) > 45){
	this.flapDir = -this.flapDir;
    }
    this.increaseWingAngle(this.flapDir*this.flapSpeed);
};
Butterfly.prototype.applyMatrix = function(matr){
    for(var part in this.wings){
	this.wings[part].applyMatrix(matr);
    };
    
};

Butterfly.prototype.setWingAngle = function(angle){

    var currAngle = this.wingAngle;
    var dir = this.dir;
    this.wings[0].rotateAround(this.loc,currAngle, dir);
    this.wings[1].rotateAround(this.loc,currAngle, dir);
    this.wings[2].rotateAround(this.loc,-currAngle,dir);
    this.wings[3].rotateAround(this.loc,-currAngle,dir);
    this.wings[0].rotateAround(this.loc,angle, dir);
    this.wings[1].rotateAround(this.loc,angle, dir);
    this.wings[2].rotateAround(this.loc,-angle,dir);
    this.wings[3].rotateAround(this.loc,-angle,dir);
    this.wingAngle = angle;


};

Butterfly.prototype.increaseWingAngle = function(angle){

    this.wingAngle += angle;
    var dir = this.dir;
    this.wings[0].rotateAround(this.loc,angle, dir);
    this.wings[1].rotateAround(this.loc,angle, dir);
    this.wings[2].rotateAround(this.loc,-angle,dir);
    this.wings[3].rotateAround(this.loc,-angle,dir);
    
};

Butterfly.prototype.rotate = function(rotateAngle,rotcenter){
    var center = rotcenter || this.loc;
    var angl = length(rotateAngle);
    //debugger;
    if(angl > 0){
	var rotM = mat4();
	rotM = mult(rotate(rotateAngle[0],[1,0,0]),rotM);
	rotM = mult(rotate(rotateAngle[1],[0,1,0]),rotM);
	rotM = mult(rotate(rotateAngle[2],[0,0,1]),rotM);
        for(var part in this.wings){
	  this.wings[part].rotateAround(center,rotateAngle[0],[1,0,0,0]);
	  this.wings[part].rotateAround(center,rotateAngle[1],[0,1,0,0]);
	  this.wings[part].rotateAround(center,rotateAngle[2],[0,0,1,0]);
	}
       this.rot  = add(rotateAngle,this.rot);
       this.rot = angleBound(this.rot);
       this.dir = mulMV(rotM,this.dir);
    }
};

Butterfly.prototype.direct = function(newDirection){
    this.timeSinceLastDirect = 0;
    var dir = this.dir;
    var change = add(dir,negate(newDirection));
    //if(length(change) < 0.5){
	//return;
    //}
    var cr = cross(newDirection,dir);
    var angle = Math.asin(length(cr))*180/Math.PI;
    var nrot = scale(-angle,normalize(cr));
    nrot[3] = 0;
    this.rotate(nrot);
};

Butterfly.prototype.render = function (gl){
    for(var part in this.wings){
	    this.wings[part].render(gl);
	}
};
