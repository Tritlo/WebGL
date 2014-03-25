
// Get a file as a string using  AJAX
function loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
	okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};

function loadShaders(gl, vShaderName, fShaderName) {
    function getShader(gl, shaderName, type) {
	var shaderElem = document.getElementById( shaderName);
	var shaderScript;
	if ( !shaderElem ) { 
	    shaderScript = loadFileAJAX(shaderName);
	    if (!shaderScript) {
		alert("Could not find shader source: "+shaderName);
	    }
	} else {
	    shaderScript = shaderElem.text;
	}
	var shader = gl.createShader(type);
	gl.shaderSource(shader, shaderScript);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    alert(gl.getShaderInfoLog(shader));
	    return null;
	}
	return shader;
    }
    var vertexShader = getShader(gl, vShaderName, gl.VERTEX_SHADER),
	fragmentShader = getShader(gl, fShaderName, gl.FRAGMENT_SHADER),
	program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	alert("Could not initialise shaders");
	return null;
    }


    return program;
};

