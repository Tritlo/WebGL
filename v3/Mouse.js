var mouse = [0,0];
var orig = [0,0];
var mouseDown = false;


function handleMouse(evt,type) {
    if(type === "scroll"){
	eye[2] += sign(evt.deltaY);
    };
    var rect = canvas.getBoundingClientRect();
    var pos = [rect.left,rect.top];
    if(type == "up"){
	mouseDown = false;
	var x =  mouse[0]-orig[0];
	var y =  mouse[1]-orig[1];
	theta[0] += x/2;
	//var truex = theta[0];
	//var cosx = Math.cos(truex);
	//var sinx = Math.sin(truex);
	theta[1] += y/2;
	//theta[2] += sinx*y;
	theta = angleBound(theta);
	theta.splice(3,1);
	temptheta = [0,0,0];
    }
    if(type==="down") {
	mouseDown = true;
	mouse = [evt.clientX - pos[0]-256,evt.clientY - pos[1]-256];
	orig = [mouse[0],mouse[1]];
	}
    if(type === "move"){
	if (mouseDown){
	    mouse = [evt.clientX - pos[0]-256,evt.clientY - pos[1]-256];
	    var x =  mouse[0]-orig[0];
	    var y =  mouse[1]-orig[1];
	    temptheta[0] = x/2;
	    //var truex = theta[0] + x;
	    //var cosx = Math.cos(truex);
	    //var sinx = Math.sin(truex);
	    temptheta[1] = y/2;
	    //temptheta[2] = sinx*y;
	}
    }
}


function handleMouseScroll(evt) {handleMouse(evt,"scroll");};
function handleMouseDown(evt) {handleMouse(evt,"down");};
function handleMouseMove(evt) {handleMouse(evt,"move");};
function handleMouseUp(evt) {handleMouse(evt,"up");};

window.addEventListener("mouseup", handleMouseUp);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("wheel", handleMouseScroll);
