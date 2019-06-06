document.addEventListener("mousemove",handleMousemove);
document.addEventListener("click",handleClick);
let count = 0;
function handleMousemove(e){
	if(e.target !== canvas){return}
	count++
	console.log("count",count);
	//get x and y
	let x = e.layerX;
	let y = e.layerY;
		//process input boundaries
	if(x<x_min){x = x_min}
	if(x>x_max){x = x_max}
	if(y<y_min){y = y_min}
	if(y>y_max){y = y_max}
		//get x and y from the on guard point (x_right, y_low), visually following the cartesian plane
	x = x - x_right;
	y = y_low - y;
	
	
	let theta = getSwordAngle(x,y);
	
	updateSword(e.layerX,e.layerY,theta); //function in client.js
}


function handleClick(e){
	if(e.target !== canvas){return}
	console.warn(e.layerX,e.layerY);
}