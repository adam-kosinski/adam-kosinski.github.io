function mod(a,b) {
	while(a<0){a=a+b}
	return a%b;
}

function drawSquare(absX,absY,options){
	if(options === "erase"){ctx.fillStyle = "white"}
	
	var xCoord = absX*gridSquareSize + xOffset;
	var yCoord = absY*gridSquareSize + yOffset;
	
	ctx.fillRect(xCoord+1,yCoord+1,gridSquareSize-2,gridSquareSize-2);
}

function drawData(absX,absY){ //absX and absY are the top-left absolute coordinates at which to draw the data
	if(nonogram[0]){
		//draw squares
		for(var r=0,nOfR=nonogram.length; r<nOfR; r++){
			for(var c=0,nOfC=nonogram[0].length; c<nOfC; c++){
				if(nonogram[r][c] === 1){
					drawSquare(absX+c, absY+r);
				}
			}
		}
	}
}

function deepCopy(object){
	var copy;
	//figure out if input is an array or a generic object
	if(Array.isArray(object)){copy = []}
	else {copy = {}}
	
	for(prop in object){
		if(typeof object[prop] === "object"){
			copy[prop] = deepCopy(object[prop]);
		} else {
			copy[prop] = object[prop]
		}
	}
	return copy;
}

//makes an array with the default value provided
function array(length,defaultVal=0){
	var a = [];
	for(var i=0; i<length; i++){
		if(typeof defaultVal === "object"){defaultVal = deepCopy(defaultVal)}
		a.push(defaultVal);
	}
	return a;
}