var fs = require("fs");
eval(fs.readFileSync("./PlyReader.js")+'');
eval(fs.readFileSync("../Common/glMatrixEA.js")+'');
var plyReader = PlyReader();
function pV(model){
    console.log(model.vertices[0]);
};

plyReader.read("teapot.ply",pV);

