function enterData(e,determineDataToEnter=false){ //only determine dataToEnter on initial mousedown, not on subsequent dragging
	
	var mini_xOffset = mod(xOffset,gridSquareSize);
	var mini_yOffset = mod(yOffset,gridSquareSize);
	
	//get absolute location coords
	var absX = Math.floor((e.layerX-xOffset)/gridSquareSize);
	var absY = Math.floor((e.layerY-yOffset)/gridSquareSize);
	
	console.log("abs",absX,absY);
	
	//determine if nonogram borders have grown
	if(minX===undefined || minY===undefined){ //if nothing yet drawn
		nonogram = [[0]];
		minX = absX;
		minY = absY;
		
	} else { //check if data location isn't in the array
		//deal with Y/rows first
		if(nonogram[absY-minY]===undefined){
				//determine how many rows to add either at the front (if diffY is -) or the end (if diffY is +) of the array
			var diffY = absY-minY;
			if(diffY >= nonogram.length){diffY -= (nonogram.length - 1)}
			if(diffY < 0){minY += diffY}
			console.log("diffY",diffY)
			
				//create rows
			var currentWidth = nonogram[0].length;
			for(var i=0; i<Math.abs(diffY); i++){
				//create new row
				var row = [];
				for(var c=0; c<currentWidth; c++){
					row.push(0);
				}
				//insert row
				diffY < 0 ? nonogram.splice(0,0,row) : nonogram.push(row);
			}
		}
		
		//deal with X/cols second
		if(nonogram[0][absX-minX]===undefined){
				//determine how many cols to add either at the front (if diffX is -) or the end (if diffX is +) of each row of the array
			var diffX = absX-minX;
			if(diffX >= nonogram[0].length){diffX -= (nonogram[0].length - 1)}
			if(diffX < 0){minX += diffX}
			console.log("diffX",diffX);
			
				//create cols
			for(var i=0; i<Math.abs(diffX); i++){
				//iterate through rows
				for(var r=0, nOfR=nonogram.length; r<nOfR; r++){
					//insert item of added col
					diffX < 0 ? nonogram[r].splice(0,0,0) : nonogram[r].push(0);
				}
			}
		}
	}
	
	
		//find coords in data array
	var dataX = absX - minX; //BTW, possibly using a new minX than previously b/c of changing nonogram size
	var dataY = absY - minY;
	
		//determine which data to enter (0 or 1)
	if(determineDataToEnter){ //this is specified by the function arguments
		if(nonogram[dataY][dataX] === 0){
			dataToEnter = 1;
			ctx.fillStyle = "black";
		} else {
			dataToEnter = 0;
			ctx.fillStyle = "white";
		}
	}
	
	
	//enter data
	nonogram[dataY][dataX] = dataToEnter;
	//draw square on canvas (fillStyle already specified by determining which data to enter)
	drawSquare(absX,absY);
	
	
	console.log("min",minX,minY);
	
	//remove extraneous rows and cols (ones w/ only zeros)
		//remove rows at beginning of array
	var allZeros = true; //assume true until find a '1'
	while (allZeros && nonogram.length>0) {
		allZeros = true;
		for(var c=0, nOfC=nonogram[0].length; c<nOfC; c++){
			if(nonogram[0][c] === 1){allZeros = false}
		}
		if(allZeros){
			nonogram.splice(0,1);
			minY++;
		}
		if(nonogram.length === 0){ //if completely erased the nonogram; don't need to check in below 3 sections (checking rows at end of array, etc.) b/c this will always catch it
			nonogram = [];
			minX = undefined;
			minY = undefined;
		}
	} //keep going until hit a row with some '1's
		
		//remove rows at end of array
	var allZeros = true; //assume true until find a '1'
	while (allZeros && nonogram.length>0){ //second check so that computer doesn't even try to remove rows/cols after nonogram completely erased
		allZeros = true;
		for(var c=0, nOfC=nonogram[0].length; c<nOfC; c++){
			if(nonogram[nonogram.length-1][c] === 1){allZeros = false}
		}
		if(allZeros){
			nonogram.splice(nonogram.length-1,1);
		}
	} //keep going until hit a row with some '1's
	
		//remove cols at beginning of array
	var allZeros = true; //assume true until find a '1'
	while (allZeros && nonogram.length>0){ //second check so that computer doesn't even try to remove rows/cols after nonogram completely erased
		allZeros = true;
		for(var r=0, nOfR=nonogram.length; r<nOfR; r++){
			if(nonogram[r][0] === 1){allZeros = false}
		}
		if(allZeros && nonogram.length>0){
			minX++;
			for(var r=0, nOfR=nonogram.length; r<nOfR; r++){
				nonogram[r].splice(0,1);
			}
		}
	} //keep going until hit a col with some '1's
	
		//remove cols at end of array
	var allZeros = true; //assume true until find a '1'
	while (allZeros && nonogram.length>0){ //second check so that computer doesn't even try to remove rows/cols after nonogram completely erased
		allZeros = true;
		for(var r=0, nOfR=nonogram.length; r<nOfR; r++){
			if(nonogram[r][nonogram[0].length-1] === 1){allZeros = false}
		}
		if(allZeros){
			for(var r=0, nOfR=nonogram.length; r<nOfR; r++){
				nonogram[r].splice(nonogram[r].length-1,1); //important that use nonogram[r] because not all rows will be the same length when splicing the last col
			}
		}
	} //keep going until hit a col with some '1's
	
	console.log(nonogram);
}