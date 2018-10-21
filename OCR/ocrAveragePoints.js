function findAveragePoints(ctx, data, blockSize, alterDisplay){
	if(!alterDisplay){alterDisplay = false}
	
	//Function will: subdivide grid into blocksize x blockSize squares, get average location of all black pixels in each square
	
	ctx.fillStyle = "red";
	var w = ctx.canvas.width;
	var h = ctx.canvas.height;
	if(alterDisplay){ctx.clearRect(0,0,w,h)}
	
	//prepare a multidimensional array to store the locations
	var outputData = [];
	for(var r=0; r<w; r++){
		var rArray = [];
		for(var c=0; c<h; c++){
			rArray.push(0);
		}
		outputData.push(rArray);
	}
	
	var avgPoints = []; //prepare a list to store the locations
	
	//loop through canvas in blockSize x blockSize sections
	for(var Y=0; Y<h; Y+=blockSize){
		for(var X=0; X<w; X+=blockSize){
			var sumY = 0; //sum of y-coords (aka row)
			var sumX = 0; //sum of x-coords (aka col)
			var numOfPx = 0;
			//loop through blockSize x blockSize section
			for(var y=0; y<blockSize; y++){
				for(var x=0; x<blockSize; x++){
					if(data[Y+y][X+x] === 1){
						sumY += Y+y;
						sumX += X+x;
						numOfPx++;
					}
				}
			}
			if(numOfPx > 0){
				var avgY = Math.floor(sumY/numOfPx);
				var avgX = Math.floor(sumX/numOfPx);
				if(alterDisplay){ctx.fillRect(avgX,avgY,1,1)}
				outputData[avgY][avgX] = 1; //we store multidimensional data [row][col]
				avgPoints.push([avgY,avgX]);
			}
		}
	}
	
	return avgPoints;
}