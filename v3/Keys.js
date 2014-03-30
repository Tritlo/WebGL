

function handleKeyDown(evt){
    var keys = {};
    var tebert = entityManager.getTebert();
    keycode = {
	73: function () { //i
	    tebert.keys("i");
	},
	74: function () { //j
	    tebert.keys("j");
	},
	75: function () { //k
	    tebert.keys("k");
	},
	76: function () { //l
	    tebert.keys("l");
	},
	87: function () { //w
	    tebert.keys("i");
	    //eye[2] += 0.1;
	},
	83: function () { //s
	    tebert.keys("k");
	    //eye[2] -= 0.1;
	},
	65: function () { //a
	    tebert.keys("j");
	    //eye[0] += 0.1;
	},
	68: function () { //d
	    tebert.keys("l");
	    //eye[0] -= 0.1;
	},
	38: function () {//<-
	    eye[1] += 0.1;
	},
	40: function () {//->
	    eye[1] -= 0.1;
	},
	81: function (){//q
	    shouldQuit = true;
	},
	69: function(){//e
	    shouldUpdate = !shouldUpdate;
	},
	82: function(){//r
	    shouldSingleStep=true;
	}

	};
    if(!(evt.shiftKey) && (evt.keyCode in keycode)){
	keycode[evt.keyCode]();
    }

};

window.addEventListener("keydown", handleKeyDown);
