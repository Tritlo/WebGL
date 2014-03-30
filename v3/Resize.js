window.onresize = function(){
    canvas.width = window.innerWidth-distFromEdgeOfScreen;
    canvas.height = window.innerHeight-distFromEdgeOfScreen;
    gl.viewport( 0, 0, canvas.width, canvas.height );
    projectionM = mat4.perspective(45,canvas.width/canvas.height,0.1,100);
};
