var fs = require("fs");
eval(fs.readFileSync("./Model.js")+'');
eval(fs.readFileSync("./PlyReader.js")+'');
eval(fs.readFileSync("../Common/glMatrixEA.js")+'');
var plyReader = PlyReader();
function pV(model){
    console.log(model.points);
};

plyReader.read("cube.ply",pV);

