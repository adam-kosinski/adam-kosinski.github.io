	//pressing or releasing shift key will change cursor appearance (only if not dragging - if so, it's locked into the grabbing hand)
	document.addEventListener("keydown",keydown);
function keydown(e){
	if(keyIsDown){return}
	keyIsDown = true;
	if(e.key === "Shift" && dragging === false){
		console.log("hi")
		canvas.style.cursor = "-webkit-grab";
		canvas.className = "cursorGrab";
	}
}

	document.addEventListener("keyup",keyup);
function keyup(e){
	keyIsDown = false;
	if(e.key === "Shift" && dragging === false){
		canvas.style.cursor = "default";
	}
	
}



/*dragging flag and dragging cursor stuff is taken care of in the nonogramMakerCanvas.js file*/



	//dragging
function drag(e){ //function called from nonogramMakerCanvas.js file
	//deal with horizontal shifting
	var prev_xOffset = xOffset;
	xOffset += e.movementX;
	
		//update display
	if(e.movementX > 0){
		var pic = ctx.getImageData(0,0,window.innerWidth-e.movementX,window.innerHeight);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.putImageData(pic,e.movementX,0);
		drawGridlines("lightblue",{xMin:0, xMax:e.movementX, yMin:0, yMax:canvas.height});
	} else if(e.movementX < 0){
		var pic = ctx.getImageData(-e.movementX,0,window.innerWidth+e.movementX,window.innerHeight);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.putImageData(pic,0,0);
		drawGridlines("lightblue",{xMin:canvas.width+e.movementX, xMax:canvas.width, yMin:0, yMax:canvas.height});
	} //if e.movementX === 0, don't need to do anything
	
	
	
	
	//deal with vertical shifting
	var prev_yOffset = yOffset;
	yOffset += e.movementY;
	
		//update display
	if(e.movementY > 0){
		var pic = ctx.getImageData(0,0,window.innerWidth,window.innerHeight-e.movementY);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.putImageData(pic,0,e.movementY);
		drawGridlines("lightblue",{xMin:0, xMax:canvas.width, yMin:0, yMax:e.movementY});
	} else if(e.movementY < 0){
		var pic = ctx.getImageData(0,-e.movementY,window.innerWidth,window.innerHeight+e.movementY);
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.putImageData(pic,0,0);
		drawGridlines("lightblue",{xMin:0, xMax:canvas.width, yMin:canvas.height+e.movementY, yMax:canvas.height});
	} //if e.movementY === 0, don't need to do anything
	
	
	
	//draw all squares - function found in utilities.js
	ctx.fillStyle = "black";
	drawData(minX,minY);
	
}