var Dirs = [[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]]; //Dir[0] is standard position (to the right), increasing index rotates counterclockwise

function getAdjPixel(data,r,c,dir){
	pxR = r + Dirs[dir][0]; //pixel row
	pxC = c + Dirs[dir][1]; //pixel column
	if(data[pxR]===undefined || data[pxR][pxC]===undefined) {
		return undefined;
	} else {
		return data[pxR][pxC];
	}
}

function isPixelEssential(data,r,c){ //returns true if removing the pixel will destroy continuity
	//a pixel is essential if there are two separated groups of black pixel(s) in the 8 px ring around the pixel
	//black pixel groups can only be separated by a white pixel horizontally or vertically adjacent to the center
	
	/*Plan of attack:
		-identify a white horizontally or vertically adjacent pixel
		-loop around the 8px ring, 2 flags: blackPixelGroupFound, groupIsolated
			-if see a black pixel, flag that a group was found
			-if see a horizontally or vertically adjacent white pixel, flag that the group is now isolated from any other potential black pixels
				-if find ANOTHER black pixel, means there are at least 2 isolated groups -> center pixel is essential
					-else, center pixel is not essential (unless no black pixels found)
	*/
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
	
	//SORT BORDER LIST SO WE CAN ITERATE AROUND THE BORDER CONTINUOUSLY
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
		for(var i=0,L=borderPixels.length; i<L; i++){
			var testR = borderPixels[i][0];
			var testC = borderPixels[i][1];
			if(Math.abs(thisR-testR)<=1 && Math.abs(thisC-testC)<=1){ //if both row and col differ by at most 1, it's adjacent
				border[0].push(borderPixels.splice(i,1)[0]);
				adjPixelFound = true;
				break; //stop looking for one after have found one
			}
		}
	}
	
	return border[0];
}

//set up new method of array object to find variance (statistics - average of squared differences from mean)
Array.prototype.variance = function(){
	var mean = this.reduce(function(a,b){return a+b}, 0)/this.length; //sum items and divide by array length
	var squaredDiffs = this.map(function(a){return (a-mean)*(a-mean)}); //create new array, using original array to determine elements
	return squaredDiffs.reduce(function(a,b){return a+b}, 0)/this.length; //sum items and divide by array length
}


var stopIteration = false;
var trailLength = 15;
var slopeCtx = document.getElementById("slopeDisplay").getContext("2d");
var dCtx = document.getElementById("deltaSlopeDisplay").getContext("2d");
var graphWidthSet = false;

function iterateAroundBorderAlpha(data,border,i=0,prevAngle = undefined,dAngleAvg){
	if(dAngleAvg === undefined){dAngleAvg = 0}
	
	//display current location on main canvas
	//if(i===0){ctx.fillStyle = (ctx.fillStyle==="#32cd32" ? "red" : "limegreen")} //that's the hex code for 'limegreen'
	ctx.fillStyle = "limegreen";
	ctx.fillRect(border[i][1],border[i][0],1,1);
	
	//determine numbers
	//console.log("r:"+border[i][0],"c:"+border[i][1]);
	ctx.fillStyle = "red";
	var trailIndex = (i+border.length-trailLength)%border.length;
	ctx.fillRect(border[trailIndex][1],border[trailIndex][0],1,1);
	var dy = border[i][0] - border[trailIndex][0];
	var dx = border[i][1] - border[trailIndex][1];
	var angle = Math.atan(dy/dx);
	var dAngle = prevAngle===undefined ? undefined : angle - prevAngle;
	//dAngle should never have an absolute value greater than pi/2, that would mean the real delta is the complementary angle with the other sign
	if(dAngle > Math.PI/2){dAngle -= Math.PI}
	if(dAngle < -Math.PI/2){dAngle += Math.PI}
	
	dAngleAvg = dAngle===undefined ? undefined : (dAngleAvg*(trailLength-1) + dAngle) / trailLength; //take average of last trailLength deltaAngles
	
	//display dAngle on graph - y range is 0 to pi/4
	//make graph the right width
	if(!graphWidthSet){
		dCtx.canvas.width = border.length;
		graphWidthSet = true;
	}
	
	//graph dAngle
	var dispY = 199 - (199 * dAngle/(Math.PI/4)); //if dAngle/(pi/4) is 0, dispY is 100, if 1, dispY is 0, if -1, dispY is 398
	dCtx.fillStyle = "black";
	dCtx.fillRect(i,dispY,1,1);
	
	//graph dAngleAvg
	dispY = 199 - (199 * dAngleAvg/(Math.PI/4));
	dCtx.fillStyle = "orange";
	dCtx.fillRect(i,dispY,1,1);
	
	//graph position on bottom
	dCtx.clearRect(0,399,dCtx.canvas.width,399);
	dCtx.fillStyle = "limegreen";
	dCtx.fillRect(i,399,1,1);
	dCtx.fillStyle = "red";
	dCtx.fillRect(trailIndex,399,1,1);
	
	//log to console
	if(dAngle!==undefined && dAngleAvg !==undefined){console.log(dAngle.toFixed(3),dAngleAvg.toFixed(3))}
	
	//display slope on slopeDisplay canvas
	slopeCtx.clearRect(0,0,slopeCtx.canvas.width,slopeCtx.canvas.height);
	
	slopeCtx.beginPath();
	slopeCtx.arc(100,100,90,0,Math.PI*2);
	slopeCtx.clip();
	
	slopeCtx.beginPath();
	slopeCtx.moveTo(100,100);
	slopeCtx.lineTo(100-(dx*100),100-(dy*100)); //100 is an arbitrarily large number
	slopeCtx.lineTo(100+(dx*100),100+(dy*100));
	slopeCtx.lineTo(100,100);
	slopeCtx.stroke();
		
	
	//prepare and set up next iteration
	i = (i+1) % border.length;
	if(i<border.length && !stopIteration){
		window.setTimeout(function(){iterateAroundBorder(data,border,i,angle,dAngleAvg)},50);
	} else {console.log("iteration terminated")}
}