//resize input to be as large as possible on the 500x500 canvas with a 5px margin (so 490x490)
//takes a binarized input
function resizeInput(ctx,data){
	//get an image of the input cropped as tightly as possible
	
	var lowerCoords = []; //[x,y]
	var upperCoords = []; //[x,y]
	
	
	//get lower x boundary
	outerLoop: //label used so can break out of both loops at same time
	for(var x=0; x<500; x++){
		for(var r=0; r<500; r++){
			if(data[r][x] === 1){
				lowerCoords[0] = x;
				break outerLoop;
			}
		}
	}
	//get lower y boundary
	outerLoop:
	for(var y=0; y<500; y++){
		for(var c=0; c<500; c++){
			if(data[y][c] === 1){
				lowerCoords[1] = y;
				break outerLoop;
			}
		}
	}
	//get upper x boundary
	outerLoop:
	for(var x=499; x>=0; x--){
		for(var r=0; r<500; r++){
			if(data[r][x] === 1){
				upperCoords[0] = x;
				break outerLoop;
			}
		}
	}
	//get upper y boundary
	outerLoop:
	for(var y=499; y>=0; y--){
		for(var c=0; c<500; c++){
			if(data[y][c] === 1){
				upperCoords[1] = y;
				break outerLoop;
			}
		}
	}
	
	
	
	//get width and height of input, and scale factor
	var width = upperCoords[0] - lowerCoords[0];
	var height = upperCoords[1] - lowerCoords[1];
	var scaleFactor = Math.min(490/width, 490/height);
	
	//extract image, store it to an outside image object
	var imageObject = new Image();
	imageObject.src = canvas.toDataURL();
	imageObject.onload = function(){ //when image has loaded the canvas data...
		//clear canvas and draw resized input
		ctx.clearRect(0,0,500,500);
		ctx.drawImage(imageObject,lowerCoords[0],lowerCoords[1],width,height,5,5,width*scaleFactor,height*scaleFactor);
		//ctx.drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth,destHeight) - dest=destination
		//'source' args have to do with extracting the pixels to draw from 'image'
	}
	
	//data = binarizeCanvas(ctx);
	
	return "Scaled by: "+scaleFactor;
}