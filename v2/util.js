//util.js (C) 2014 Matthias Pall Gissurarson
function mulMV(matr,vec){
    var result = [];
    for(var i = 0; i < matr.length; i++){
	var m = matr[i];
	var s = 0;
	for(var j = 0; j < m.length; j++){
	    s+= m[j]*vec[j];
	}
	result.push(s);
    };
    return vec4(result);

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
