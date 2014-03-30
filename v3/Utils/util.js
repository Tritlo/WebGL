//util.js (C) 2014 Matthias Pall Gissurarson
// A tiny little convenience function
function keyCode(keyChar) {
    return keyChar.charCodeAt(0);
}

function angleBound(rot){
    var r = [rot[0] % 360,rot[1] % 360,rot[2] % 360,rot[3]];
    return r;
};

function sign(x){
    if( x===0){
	return 0;
    };
    return x/Math.sqrt(x*x);
};

function radians( degrees ) {
    const Pi = 3.1415926535897932384626433;
    return degrees * Pi / 180.0;
}

function randInt(start, end) {
    return Math.floor(start + Math.random() * (end - start));
}

function manhattanDist(x,y) {
    return Math.abs(x) + Math.abs(y);
}

function colorToName(x){
    var st = "";
    for(var i = 0; i < 3; i++){
	st += Math.round(x[i]*255).toString(16);
    };
    return "#"+st;
};

function roundArr(x){
    for(var i = 0; i < x.length; i++){
	x[i] = Math.round(x[i]);
    }
    return x;
}


function modulus(x,y){
    return ((x%y) + y) % y;
}

function clampRange(val,low,high){
    if(val < low)
	return low;
    if(val > high)
	return high;
    return val;
};

/*
N: modelViewM = AzElView(azim,elev,loc)
F: azim er float á bilinu 0.0-360.0
   elev er float á bilinu 0.0-90.0
   loc er staðsetningavigur.
E: modelViewM er fylki, sem varpar punktum thannig ad
 Ahorfandi er standandi i loc, og horfandi
 azmiuth gradur til vinstri fra z-as
 og elevation gradur upp fra x-as
*/
function AzElView(azimuth, elevation, location,log){
    var result = mat4();
    var l = location;
    //Sja mynd i 4.3.4 i Angel
    //Vid viljum ad thegar azmiuth er 0,
    //tha se verid ad horfa nidur eftir z-as,
    //Viljum ad haerra azimuth se meira til vinstri.
    //Viljum ad haerra elvation se meira upp, 
    result = mult(translate(-l[0],-l[1],-l[2]),result);
    result = mult(rotate(180-azimuth,[0,1,0]),result);
    result = mult(rotate(-elevation,[1,0,0]),result);
    return result;

};

function createSolidTexture(color,outergl) {
    if(outergl) 
	var gl = outergl;
    color[0]*= 255;
    color[1]*= 255;
    color[2]*= 255;
    color[3]*= 255;
    var data = new Uint8Array(color);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return texture;
}
