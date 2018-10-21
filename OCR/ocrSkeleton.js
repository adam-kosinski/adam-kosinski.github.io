function skeleton(ctx, data, blockSize){
	//get average points
	var avgPoints = findAveragePoints(ctx, data, blockSize); //points stored [row,col]
	
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height); //clear canvas
	ctx.lineWidth = 1; //prepare for line stroking
	
	//loop through average points
	for(var I=0,L=avgPoints.length; I<L; I++){ //important that length is calculated ONCE, before looping, b/c will be removing items from avgPoints
		//remove point that we're currently looking at from avgPoints so we don't compare a point with itself,
		//and so we don't double count pairs
		var thisPoint = avgPoints.splice(0,1)[0];
		
		//loop through average points, check distance between points
		for(var i=0,l=avgPoints.length; i<l; i++){
			//if pixels are within 20 pixels of each other, connect them
			if(distanceBetween(thisPoint, avgPoints[i]) <= 20){
				ctx.beginPath();
				ctx.moveTo(thisPoint[1],thisPoint[0]);
				ctx.lineTo(avgPoints[i][1],avgPoints[i][0]);
				ctx.stroke();
			}
		}
	}
	
	//binarize canvas again
	data = binarizeCanvas(ctx);
	
	debugger;
	
	//get loops
	var loops = findLoops(data);
	
	//loop through loops, fill in loops with an area of <100 pixels
	for(var i=0,L=loops.length; i<L; i++){
		if(loops[i].pixels.length < 100){
			for(p=0,l=loops[i].pixels.length; p<l; p++){
				ctx.fillRect(loops[i].pixels[p][1], loops[i].pixels[p][0], 1, 1);
			}
		}
	}
	
	debugger;
	
	console.log("done skeletonizing");
}

function distanceBetween(coord1, coord2){
	var dy = coord2[0]-coord1[0];
	var dx = coord2[1]-coord1[1];
	return Math.sqrt((dx*dx) + (dy*dy));
}