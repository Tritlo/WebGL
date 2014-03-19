var PlyReader =(function(){
var parser = {
    //Use: plyReader.parse(data);
    //Pre: data is a string of a ply file
    //Pos: returns an object with the elements of the plyfile
    parse: function(data){
	console.log(data);
    },
    //works both in node.js and on web.
    read: function(file){
	var data;
	if(typeof window === 'undefined'){
	    var fs = require("fs");
	    data = fs.readFileSync(file)+'';
	    this.parse(data);
	} else {
	    var request = new XMLHttpRequest();
	    var reader = this;
	    request.open('GET', file, true);
	    request.onload = function() {
	      if (this.status >= 200 && this.status < 400){
		  data = this.response;
		  reader.parse(data);
	      }
	    };
	    request.onerror = function() {
	    };
	    request.send();
	}
    }
};
Parser = function() {};
Parser.prototype = parser;
parser.Parser = Parser;
return new Parser;
});
