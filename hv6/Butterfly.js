function Butterfly(descr){
    this.loc = [0,0,0,1.0];
    this.rot = [0,0,0,0];
    this.dir = [0,1,0,0];
    this.speed = 0;
    this.wingAngle = 0;
    this.flapDir = 1;
    this.flapSpeed = 0.1;
    this.size=5;
    this.timeSinceLastDirect = Infinity;
    this.decisionTime = 5;
    for(var prop in descr){
	this[prop] = descr[prop];
    }
    this.init();
}



Butterfly.prototype.init = function (){
    var s = this.size;
    //var upperleft = new Cube({"vColors": this.ulcols || this.color});
    var tlen = this.textures.length;
    var upperleft = new Cube({"textureSrc" : this.textures[0]});
    upperleft.scale(s*1.0,s*1.0,s*0.2);
    var lowerleft = new Cube({"textureSrc" : this.textures[1 % tlen]});
    //var lowerleft = new Cube({"vColors": this.llcols || this.color});
    lowerleft.scale(s*1.5,s*1.5,s*0.2);
    
    
    //var upperright = new Cube({"vColors": this.urcols || this.ulcols || this.color});
    var upperright = new Cube({"textureSrc" : this.textures[2 % tlen]});
    upperright.scale(s*1.0,s*1.0,s*0.2);
    //var lowerright = new Cube({"vColors": this.lrcols || this.llcols || this.color});
    var lowerright = new Cube({"textureSrc" : this.textures[3 % tlen]});
    lowerright.scale(s*1.5,s*1.5,s*0.2);

    upperleft.translate(-0.6 *s,-0.60*s,0);
    upperright.translate(0.6 *s,-0.60*s,0);
    lowerleft.translate(-0.85*s, 0.85*s,0);
    lowerright.translate(0.85*s, 0.85*s,0);
    
    var body = new Cube({"vColors": this.color || [[0.5,0.5,0.5,1]]});
    
    body.scale(s*0.2,s*2.5,s*0.2);
    body.translate(s*0.0,s*0.5,s*0.2);

    this.wings = [upperleft,lowerleft,upperright,lowerright];
    this.body = body;
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
    var trans = vec4.scale(this.dir,du*this.speed,vec4.create());
    this.translate(trans);
};

Butterfly.prototype.translate = function(vec){
    for(var part in this.wings){
	this.wings[part].translate(vec);
    }
    this.body.translate(vec);
    vec4.add(this.loc,vec);
    this.loc[3] = 1;
};



Butterfly.prototype.updateWings = function(du){
    if (Math.abs(this.wingAngle) > radians(45)){
	this.flapDir = -this.flapDir;
    }
    this.increaseWingAngle(this.flapDir*this.flapSpeed);
};
Butterfly.prototype.applyMatrix = function(matr){
    for(var part in this.wings){
	this.wings[part].applyMatrix(matr);
    };
    this.body.applyMatrix(matr);
    
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
    var angl = vec4.length(rotateAngle);
    //debugger;
    if(angl > 0){
	var rotM = mat4.identity(mat4.create());
	rotM = mat4.multiply(mat4.rotate(mat4.identity(mat4.create()),rotateAngle[0],[1,0,0]),rotM,rotM);
	rotM = mat4.multiply(mat4.rotate(mat4.identity(mat4.create()),rotateAngle[1],[0,1,0]),rotM,rotM);
	rotM = mat4.multiply(mat4.rotate(mat4.identity(mat4.create()),rotateAngle[2],[0,0,1]),rotM,rotM);
        for(var part in this.wings){
	  this.wings[part].rotateAround(center,rotateAngle[0],[1,0,0,0]);
	  this.wings[part].rotateAround(center,rotateAngle[1],[0,1,0,0]);
	  this.wings[part].rotateAround(center,rotateAngle[2],[0,0,1,0]);
	}
       this.body.rotateAround(center,rotateAngle[0],[1,0,0,0]);
       this.body.rotateAround(center,rotateAngle[1],[0,1,0,0]);
       this.body.rotateAround(center,rotateAngle[2],[0,0,1,0]);
       this.rot  = vec4.add(vec4.create(rotateAngle),this.rot,this.rot);
       this.dir = mat4.multiplyVec4(rotM,this.dir);
    }
};

Butterfly.prototype.direct = function(newDirection){
    this.timeSinceLastDirect = 0;
    var dir = vec4.create(this.dir);
    var change = vec4.add(dir,vec4.negate(newDirection));
    //if(length(change) < 0.5){
	//return;
    //}
    var cr = vec4.cross(newDirection,dir);
    var angle = Math.asin(vec4.length(cr));
    var nrot = vec4.scale(vec4.normalize(cr),-angle);
    nrot[3] = 0;
    this.rotate(nrot);
};

Butterfly.prototype.render = function (gl){
    for(var part in this.wings){
	    this.wings[part].render(gl);
	}
    this.body.render(gl);
   
};
