document.addEventListener("mousemove",handleMousemove);
document.addEventListener("mousedown",handleMousedown);
document.addEventListener("mouseup",handleMouseup);
document.addEventListener("wheel",handleWheel);


let count = 0;
function handleMousemove(e){
	if(!player_data){return;} //without initial state, things will break

	//get x and y of mouse with respect to center of window for x, bottom of window for y
	let mx = e.layerX - window.innerWidth/2;
	let my = (e.layerY - window.innerHeight) * -1; //-1 because I want up to be positive, (default is down is positive)

	//change it to sword's x and y
	let sx = mx/px_per_inch;
	let sy = my/px_per_inch + 30;
	
	updateSword({x:sx, y:sy});
}


function handleMousedown(e){
	if(!player_data){return;} //without initial state, things will break
	
	if(e.button === 0){
		updateSword({snap: min_sword_snap});
	}
	else if (e.button === 2){
	}
}

function handleMouseup(e){
	if(!player_data){return;} //without initial state, things will break
	
	if(e.button === 0){
		updateSword({snap: max_sword_snap});
	}
	else if (e.button === 2){
	}
}

function handleWheel(e){
	if(!player_data){return;} //without initial state, things will break
	
	//e.deltaY stores how much is scrolled, in px. Negative is scroll up
	//figure how much to rotate left/right based on this. Scroll down should be rotate clockwise on the screen
	let d_angle = e.deltaY / px_scroll_per_radian;

	updateSword({angle: player_data[id].target.sword.angle += d_angle});
}
