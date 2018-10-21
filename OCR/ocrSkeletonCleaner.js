var Dirs = [[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]]; //given as [r,c]. Dir[0] is standard position (to the right), increasing index rotates counterclockwise

function getAdjPixel(data,r,c,dir){
	pxR = r + Dirs[dir][0]; //pixel row
	pxC = c + Dirs[dir][1]; //pixel column
	if(data[pxR]===undefined || data[pxR][pxC]===undefined) {
		return undefined;
	} else {
		return data[pxR][pxC];
	}
}

var essentialPixels = [];

function isPixelEssential(data,r,c){ //returns true if removing the pixel will destroy continuity
	//a pixel is essential if there are two separated groups of black pixel(s) in the 8 px ring around the pixel
	//black pixel groups can only be separated by a white or undefined pixel horizontally or vertically adjacent to the center
	
	/*Plan of attack:
		-identify a white or undefined horizontally or vertically adjacent pixel
			-if none, pixel is essential (b/c removing it would create a hole that wasn't there before)
		-loop around the 8px ring, 2 flags: blackPixelGroupFound, groupIsolated
			-if see a black pixel, flag that a group was found
			-if see a horizontally or vertically adjacent white pixel, flag that the group is now isolated from any other potential black pixels
				-if find ANOTHER black pixel, means there are at least 2 isolated groups -> center pixel is essential
					-else, center pixel is not essential (unless no black pixels found)
	*/
	
	if(data[r][c] !== 1){return false} //non-black pixels are not essential
	
	//search for a horiz./vert. adj. white or undefined pixel
	var whitePixelLocation = undefined;
	for(var i=0; i<8; i=i+2){
		var pixel = getAdjPixel(data,r,c,i);
		if(pixel===0 || pixel===undefined){whitePixelLocation = i}
	}
	
	if(whitePixelLocation){ //if found a white pixel, proceed with process
		var blackPixelGroupFound = false;
		var groupIsolated = false;
		
		for(var i=whitePixelLocation+1, i_stop=whitePixelLocation+8; i<i_stop; i++){ //i will not always be 0-7, use mod 8 when interpreting it, and remember that -3%8 -> -3
			var pixel = getAdjPixel(data,r,c,(i+8)%8);
			if((pixel===0 || pixel===undefined) && i%2===0 && blackPixelGroupFound){groupIsolated = true} //if horiz/vert adj. white or undefined pixel
			if(pixel===1){
				if(groupIsolated){return true} //if there's already an isolated group, this is a second one -> essential pixel
				blackPixelGroupFound = true; //doesn't matter if this gets set to true more times than necessary
			}
		}
		return false; //if pixel wasn't identified as essential by above for loop, it's not essential
		
	} else { //if no white pixel found
		return true; //pixel is essential if no white pixels around it (removing it would create a hole)
	}
}

//determines if a motion is clockwise or counterclockwise around the border (clockwise means pixels to the right with respect to direction of motion)
function movingClockwise(data,coord1,coord2){ //coords entered [r,c]
	//make simpler references
	var r1 = coord1[0];
	var c1 = coord1[1];
	var r2 = coord2[0];
	var c2 = coord2[1];
	
	//determine direction of movement
	var dx = c2 - c1;
	var dy = r2 - r1;
	var dir;
	for(var i=0; i<8; i++){
		if(Dirs[i][0]===dy && Dirs[i][1]===dx){dir = i}
	}
	
	//get pixels to the left/right of the dir of motion
	var leftPixels = [getAdjPixel(data,r2,c2,(dir+1)%8), getAdjPixel(data,r2,c2,(dir+2)%8), getAdjPixel(data,r2,c2,(dir+3)%8)];
	var rightPixels = [getAdjPixel(data,r2,c2,(dir-1+8)%8), getAdjPixel(data,r2,c2,(dir-2+8)%8), getAdjPixel(data,r2,c2,(dir-3+8)%8)];
	
	//if some pixels on one side and none on the other, can make a call, otherwise can't*
	//get booleans
	left = leftPixels[0] || leftPixels[1] || leftPixels[2];
	right = rightPixels[0] || rightPixels[1] || rightPixels[2];
	//evaluate
	if(left && !right){return false} //counterclockwise
	if(right && !left){return true} //clockwise
	
	return "unknown"; //default return value
	
	//*:
	//	1,0,1
	//	>,*,1
	//	1,0,1
}

function analyzeBorder(data){ //assumes no border is touching the edge of the canvas
	//get border pixels (white pixels horizontally or vertically adjacent to a black pixel)
	var borderPixels = [];
	for(var r=0,height=data.length; r<height; r++){
		for(var c=0,width=data[0].length; c<width; c++){
			if(data[r][c] === 0 && (getAdjPixel(data,r,c,0)===1 ||
									getAdjPixel(data,r,c,2)===1 ||
									getAdjPixel(data,r,c,4)===1 ||
									getAdjPixel(data,r,c,6)===1)) {
				borderPixels.push([r,c]);
			}
		}
	}
	
	//SORT BORDER PIXELS SO WE CAN ITERATE AROUND THE BORDER CONTINUOUSLY
	//this may require identifying multiple disconnected sections of border; each of these sections will occupy a spot at depth=1 of the variable "border"
		//-note: the first one identified will be the outer border, because of the method by which the border pixels were found, and b/c we initialize border[0]
		//		to contain the first border pixel found by that method
	//depth=2 will be for the actual ordered border list(s)
	var border = [[]];
	
	border[0].push(borderPixels.splice(0,1)[0]); //remember, splice returns an array
	
	var adjPixelFound = true; //flag for if should keep looking for border pixels, if no adjacent pixel found, means we have completed sorting the section of border
	
	while(adjPixelFound){
		//loop through borderPixels looking for an adjacent border pixel
		adjPixelFound = false; //assume there isn't an adjacent pixel until we find one
		var thisR = border[0][border[0].length-1][0]; //get r and c of latest pixel added to sorted border
		var thisC = border[0][border[0].length-1][1];
		for(var i=0,L=borderPixels.length; i<L; i++){ //loop through borderPixels
			var testR = borderPixels[i][0];
			var testC = borderPixels[i][1];
			if(Math.abs(thisR-testR)<=1 && Math.abs(thisC-testC)<=1){ //if both row and col differ by at most 1, it's adjacent
				border[0].push(borderPixels.splice(i,1)[0]);
				adjPixelFound = true;
				break; //stop looping through borderPixels searching for an adjancent pixel after having found one
			}
		}
	}
	
	return border[0]; //temporary
}

//set up a new method of Array object to find variance (statistics - average of squared differences from mean)
Array.prototype.variance = function(){
	var mean = this.reduce(function(a,b){return a+b}, 0)/this.length; //sum items and divide by array length
	var squaredDiffs = this.map(function(a){return (a-mean)*(a-mean)}); //create new array, using original array to determine elements
	return squaredDiffs.reduce(function(a,b){return a+b}, 0)/this.length; //sum items and divide by array length
}

//arr.reduce() takes two arguments:
//1. callback function(storage var, current element, current index, arrayBeingCalledOn)
//2. initial value -> placed in 'storage'

Array.prototype.circularVariance = function(){ //for a collection of angles in radians
	var sinSum = 0;
	var cosSum = 0;
	for(var idx=0,len=this.length; idx<len; idx++){ //sum sines and cosines of angles
		sinSum += Math.sin(this[idx]);
		cosSum += Math.cos(this[idx]);
	}
	var meanSin = sinSum/this.length; //use sums to determine means
	var meanCos = cosSum/this.length;
	
	var newRadius = Math.sqrt(meanSin*meanSin + meanCos*meanCos); //a value of 1 means all angles were the same; a value of 0 means they were evenly distributed
	return 1-newRadius;
}

Array.prototype.mode = function(){
	
}


var stopIteration = false;
var averageLineWidth = 10;
var slopeCtx = document.getElementById("slopeDisplay").getContext("2d");
var dCtx = document.getElementById("deltaSlopeDisplay").getContext("2d");
var graphWidthSet = false;

//storage variables
var dyData = [];
var dxData = [];
var dirsData = [];
var deltaDirsData = []; 
var circularVarianceData = [];

function calculateBorderVariance(data,border){
	for(var i=0, L=border.length; i<L; i++){
		//all deltas are from 'this' pixel TO next pixel
		var thisPxl = border[i];
		var nextPxl = border[(i+1)%L];
		
		var dy = nextPxl[0] - thisPxl[0]; //get change in y and x for moving to next pixel
		var dx = nextPxl[1] - thisPxl[1];
	}
}


function iterateAroundBorder(data,border,i=0,savedDisplay){ //"border" here is not the global border variable, but a continuous section of the border
	if(i===0){
		colorPixels(ctx,border,"white");
	}
	
	
	//determine numbers
	//console.log("r:"+border[i][0],"c:"+border[i][1]);
	var thisPxl = border[i];
	var nextPxl = border[(i+1)%border.length];
	
	ctx.fillStyle = "red";
	ctx.fillRect(nextPxl[1],nextPxl[0],1,1);
	ctx.fillStyle = "limegreen";
	ctx.fillRect(thisPxl[1],thisPxl[0],1,1);
	
	var dy = nextPxl[0] - thisPxl[0]; //get deltas for moving to the next pixel
	var dx = nextPxl[1] - thisPxl[1];
	
	//record dy and dx
	dyData[i] = dy;
	dxData[i] = dx;
	
	//figure out direction number, record that
	for(var q=0; q<8; q++){
		if(dyData[i]===Dirs[q][0] && dxData[i]===Dirs[q][1]){
			dirsData[i] = q;
		}
	}
	
	if(!graphWidthSet){
		dCtx.canvas.width = border.length;
		graphWidthSet = true;
	}
	
	dAngle = Math.atan(dy/dx);
	
	//remove previous vertical bar that was indicating position
	if(savedDisplay){dCtx.putImageData(savedDisplay,0,0)}
	
	//graph variance of dy, dx, and dirs; and record delta dirs, if data collected
	if(dyData.length===border.length && dxData.length===border.length){
		//record change in dir to the next pixel
		var changeInDir = dirsData[(i+1)%border.length] - dirsData[i];
		if(Math.abs(changeInDir) > 1){changeInDir *= -1/7} //accounts for if comparing dirs 0 and 7
		deltaDirsData[i] = changeInDir;
		
		//GET SLICE THAT WE WILL CALCULATE VARIANCE FOR
		var dySlice;
		var dxSlice;
		var dirsSlice;
		var deltaDirsSlice;
		//get start and end indices (inclusive)
		var sIdx = (i-Math.floor(1.5*averageLineWidth)); //size of slice should be ~3 times the average line width
		var eIdx = (i+Math.floor(1.5*averageLineWidth));
		
		if(sIdx < 0){
			dySlice = dyData.slice(sIdx).concat(dyData.slice(0,eIdx+1)); //slice from negative sIdx to end and concatenate onto that a slice from 0 to eIdx inclusive
			dxSlice = dxData.slice(sIdx).concat(dxData.slice(0,eIdx+1));
			dirsSlice = dirsData.slice(sIdx).concat(dirsData.slice(0,eIdx+1));
			deltaDirsSlice = deltaDirsData.slice(sIdx).concat(deltaDirsData.slice(0,eIdx+1));
		}
		else if(eIdx > border.length){
			dySlice = dyData.slice(sIdx).concat(dyData.slice(0,eIdx+1-border.length)); //slice from sIdx to end and concatenate onto that a slice from 0 to eIdx-border.length inclusive
			dxSlice = dxData.slice(sIdx).concat(dxData.slice(0,eIdx+1-border.length));
			dirsSlice = dirsData.slice(sIdx).concat(dirsData.slice(0,eIdx+1-border.length));
			deltaDirsSlice = deltaDirsData.slice(sIdx).concat(deltaDirsData.slice(0,eIdx+1-border.length));
		} else {
			dySlice = dyData.slice(sIdx,eIdx+1); //do it normally otherwise
			dxSlice = dxData.slice(sIdx,eIdx+1);
			dirsSlice = dirsData.slice(sIdx,eIdx+1);
			deltaDirsSlice = deltaDirsData.slice(sIdx,eIdx+1);
		}
		
		//calculate and graph variances - blue=dy, red=dx
		/*dCtx.fillStyle = "blue";
		dCtx.fillRect(i,200 - (dySlice.variance()*190), 1,1); //variance will be maximum 1
		
		dCtx.fillStyle = "red";
		dCtx.fillRect(i,200 - (dxSlice.variance()*190), 1,1);*/
		
		var deltaDirsSliceAvg = deltaDirsSlice.reduce(function(a,b,currentIdx,thisArray){ //take average
			return a+b;
		}, 0) / deltaDirsSlice.length;
		dCtx.fillStyle = "green";
		dCtx.fillRect(i,200 - (deltaDirsSliceAvg*190), 1,1);
		
		var sign = deltaDirsSliceAvg !== 0 ? deltaDirsSliceAvg/Math.abs(deltaDirsSliceAvg) : 1; //if average is exactly 0, use positive sign
		
		dCtx.fillStyle = "saddlebrown";
		dirsSlice = dirsSlice.map(function(a){return (a/8)*2*Math.PI}); //convert to angles in radians
		circularVarianceData[i] = Math.pow(dirsSlice.circularVariance(),1);
		varianceDisplay.textContent = Math.round(circularVarianceData[i]*1000) / 1000;
		if(!/\./.test(varianceDisplay.textContent)){varianceDisplay.textContent += "."}
		while(varianceDisplay.textContent.length < 5){varianceDisplay.textContent += "0"}
		if(circularVarianceData[i]*10 > 1){ //if variance >= 0.1 it's a sharp turn region
			slopeCtx.fillStyle = "lightgreen";
			slopeCtx.fillRect(0,0,200,200);
		} else {
			slopeCtx.clearRect(0,0,200,200);
		}
		dCtx.fillRect(i,200 - (circularVarianceData[i]*190), 1,1);
	}
	
	
	//store canvas display
	var savedDisplay = dCtx.getImageData(0,0,dCtx.canvas.width,dCtx.canvas.height);
	
	//graph position as a vertical 1px wide bar
	dCtx.fillStyle = "red";
	dCtx.fillRect(i,0,1,400);
	
	//graph 0 line
	dCtx.fillStyle = "black";
	dCtx.fillRect(0,200,border.length,1);
	
	//graph cutoff
	dCtx.fillRect(0,200-(0.1*190),border.length,1);
	
	
	//prepare and set up next iteration
	i = (i+1) % border.length;
	if(i<border.length && !stopIteration){
		window.setTimeout(function(){iterateAroundBorder(data,border,i,savedDisplay)},jar);
	} else {console.log("iteration terminated")}
}