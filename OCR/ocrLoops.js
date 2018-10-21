function deepCopy(array){
	//loop through array, pushing items into an output array. Call the function recursively to deal with nested arrays.
	var outputArray = [];
	for(var i=0,L=array.length; i<L; i++){
		if(typeof array[i] === "object"){
			outputArray.push(deepCopy(array[i]));
		} else{
			outputArray.push(array[i]);
		}
	}
	return outputArray;
}

//loop prototype constructor
function Loop(pixels,border,isClosed){
	this.pixels = pixels;
	this.border = border;
	this.isClosed = isClosed;
}

function findLoops(data){
	var dataCopy = deepCopy(data); //don't want to mess up input when editing the data grid in the function
	var output = [];
	
	//loop through data pixels
	var nOfR = dataCopy.length;
	var nOfC = dataCopy[0].length;
	for(var r=0; r<nOfR; r++){
		for(var c=0; c<nOfC; c++){
			//if found a white pixel, initiate a gas-model spread
			if(dataCopy[r][c] === 0){
				var loop = gasModelSpread(dataCopy,r,c);
				if(loop.isClosed){output.push(loop)} //only push closed loops
			}
		}
	}
	return output;
}

function gasModelSpread(data,R,C){ //no copy made of data b/c I DO want to modify the input
	if(data[R][C] !== 0){return undefined} //just a precaution
	
	var pixels = [[R,C]];
	var border = [];
	
	var isClosed = true; //assume that loop is closed unless 'gas' leaks out of canvas
	
	var mostRecentExpansion = [[R,C]]; //an array storing the most recent pixels expanded to so I don't have to iterate through
									//all of 'data' each expansion to find them
	var thisExpansion = []; //stores pixels of an expansion while expansion is going on
	
	//function for examining and marking/recording pixels
	function examinePixel(r,c){
		if(data[r]!==undefined && data[r][c]!==undefined){ //if pixel exists in the canvas
			if(data[r][c] === 0){
				data[r][c] = -1; //-1 is a marker meaning the pixel was counted
				thisExpansion.push([r,c]);
				pixels.push([r,c]);
			}
			if(data[r][c] === 1){
				return true; //returning true means that the pixel was black, will be analyzed below
			}
		} else {isClosed = false} //meaning pixel is outside of the canvas
		return false; //default return value
	}
	
	while(mostRecentExpansion.length){ //keep running expansions until no expansion was made -> means we're done
		thisExpansion = []; //clear thisExpansion
		
		//loop through mostRecentExpansion
		for(var i=0,L=mostRecentExpansion.length; i<L; i++){
			var r = mostRecentExpansion[i][0];
			var c = mostRecentExpansion[i][1];
			
			//examine pixels up,left,right,down of this pixel, marking them if applicable, etc.; store return values
			var up = examinePixel(r-1,c);
			var left = examinePixel(r,c-1);
			var right = examinePixel(r,c+1);
			var down = examinePixel(r+1,c);
			if(up || left || right || down){
				//if examinePixel returned true, means it was a black pixel -> means r,c is a border pixel
				border.push([r,c]);
			}
		}
		
		mostRecentExpansion = thisExpansion.slice(); //copy it over
	}
	return new Loop(pixels,border,isClosed);
}

function colorPixels(ctx,pixels,color){
	ctx.fillStyle = color;
	//loop through pixels
	for(var i=0,L=pixels.length; i<L; i++){
		ctx.fillRect(pixels[i][1],pixels[i][0],1,1);
	}
}