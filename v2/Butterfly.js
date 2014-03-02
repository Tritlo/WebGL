function Butterfly(descr){
    this.loc = [0,0,0,1.0];
    this.normal = [0,0,1,0];
    this.direction = [0,1,0,0];
    this.rot = 0;
    this.vel = [0,0,0,0];
    this.wingAngle = 0;
    this.flapDir = 1;
    this.flapSpeed = 10;
    this.size=1;
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
    for(var part in this.wings){
	//this.wings[part].renderVertices = true;
	//this.wings[part].normal = this.normal;
    }
    /*
    
    for(var part in this.wings){
	this.wings[part].normal = this.normal;
    }
     */

    /*
    if(this.startLoc)
	this.translate(this.startLoc);
    if(this.startVel){
	this.updateVel(this.startVel); 
    }
     */
    
    

    //this.orient(this.normal);

};

Butterfly.prototype.update = function(du){
    this.translate(scale(du,this.vel));
    //this.updateVel(add([0.0001,0.0001,0.0,0.0],this.vel));
    this.updateWings(du);
};

Butterfly.prototype.translate = function(vec){
    for(var part in this.wings){
	this.wings[part].translate(vec);
    }
    this.loc = add(this.loc,vec);

};

Butterfly.prototype.orient = function(newNormal){
    for(var part in this.wings){
	this.wings[part].orient(newNormal,this.loc);
    };
    this.normal = newNormal;
};


Butterfly.prototype.updateWings = function(du){
    if (Math.abs(this.wingAngle) > 45){
	this.flapDir = -this.flapDir;
    }

    this.increaseWingAngle(this.flapDir*this.flapSpeed);


};

Butterfly.prototype.increaseWingAngle = function(angle){

    this.wingAngle += angle;

    this.orient([0,0,1,0]);
    this.wings[0].rotateAround(this.loc,angle, [0,1,0,0]);
    this.wings[1].rotateAround(this.loc,angle, [0,1,0,0]);
    this.wings[2].rotateAround(this.loc,-angle,[0,1,0,0]);
    this.wings[3].rotateAround(this.loc,-angle,[0,1,0,0]);
    

};

Butterfly.prototype.rotate = function(angle){
    var norm = this.normal;
    var loc = this.loc;
    this.translate(negate(loc));
    this.orient([0,0,1,0]);
    for(var part in this.wings){
	this.wings[part].rotate(this.loc,angle,[0,0,1]);
    }
    this.orient(norm);
    this.translate(loc);

};

Butterfly.prototype.direct = function(newDirection){
    var newDir = newDirection;
    var cr = cross(newDir,this.direction);
    console.log(length(cr));
    if(length(cr) > 0){
	var angl = Math.asin(length(cr))*180/(Math.PI);
	var ncr = normalize(cr);
	var rotM = rotate(-angl,ncr);
	var newNormal = mulMV(rotM,this.normal);
	console.log(newNormal,this.normal);
    } else {
	var newNormal = negate(this.normal);
    }
    for(var part in this.wings){
	this.wings[part].direct(newDirection,this.loc);
    }
    this.orient(newNormal);
    this.normal = newNormal;
    this.direction = newDir;
};

Butterfly.prototype.updateVel = function(newVel){

    if(length(newVel) != 0){
	this.direct(normalize(newVel));
	//this.flapSpeed = length(newVel) +1;
    };
    this.vel = newVel;
};

Butterfly.prototype.render = function (gl){
    for(var part in this.wings){
	    this.wings[part].render(gl);
	}
};
