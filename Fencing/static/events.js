document.addEventListener("mousemove",handleMousemove);
document.addEventListener("mousedown",handleMousedown);
document.addEventListener("mouseup",handleMouseup);
document.addEventListener("wheel",handleWheel);


let count = 0;
function handleMousemove(e){
	
	//get x and y of mouse with respect to center of window for x, bottom of window for y
	let mx = e.layerX - window.innerWidth/2;
	let my = (e.layerY - window.innerHeight) * -1; //-1 because I want up to be positive, (default is down is positive)

	//change it to sword's x and y
	let sx = mx/px_per_inch;
	let sy = my/px_per_inch + 30;
	
	updateSword({x:sx, y:sy});
}


function handleMousedown(e){
	if(e.button === 0){
		updateSword({x_rot: min_x_rot});
	}
	else if (e.button === 2){
	}
}

function handleMouseup(e){
	if(e.button === 0){
		updateSword({x_rot: max_x_rot});
	}
	else if (e.button === 2){
	}
}


function handleWheel(e){
	//e.deltaY stores how much is scrolled, in px. Negative is scroll up
	console.log(e.deltaY);	
	//figure how much to rotate on the z-axis based on this. Scroll down should be rotate clockwise on the screen
	let dz_rot = - e.deltaY / px_scroll_per_radian;

	if(!me){return}
	updateSword({z_rot: me.target.sword.rotation.z += dz_rot});
}
