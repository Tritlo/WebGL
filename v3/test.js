var fs = require("fs");
eval(fs.readFileSync("./PlyReader.js")+'');
eval(fs.readFileSync("../Common/glMatrixEA.js")+'');
var plyReader = PlyReader();
//plyReader.read("teapot.ply");
