//function to determine the angle and start theta of loops. Attempts to avoid drawing loops over other edges, if enough space.
//returns an array of loop starting thetas and the angle the loop takes up. Format: [{theta:?, angle:?}, ...]

function loopLocations(emptyAngles, nLoops, defaultAngle, overlap=false, knownLoopLocations){
	//emptyAngles is an array of angle ranges ([theta_1,theta_2] where the range is determined by rotating counterclockwise from theta_1 to theta_2
	//nLoops is how many loops will exist for the vertex in question
	//defaultAngle is the max angle; the angle of the loop that would be drawn if there were no other edges
		
		/*For when this function calls itself b/c there's not enough space for loops*/
	//overlap is if in this call we're allowing overlap with straight edges - used to figure out what to do if there's not enough space for no overlap
	//knownLoopLocations is a previous output array of this function, to be added to the output array if there's space for all the loops
	
	
	let output = [];
	
	let minAngle = (2*Math.PI/12) * (2/3); //smallest acceptable angle with still trying to avoid other edges, 2/3 b/c of gap between loop edges
	
	//define maxNumberLoops, an array corresponding to emptyAngles, listing the max number of loops that can be drawn in this area (using minAngle)
	let maxNumberLoops = [];
	for(var a=0; a<emptyAngles.length; a++){ //iterate through emptyAngles
		//while we're at it, make the start angle of each angle range less than the end angle, so we can get positive differences easier (means going out of 0-2pi in some cases)
		if(emptyAngles[a][1] <= emptyAngles[a][0]){ //if they are the same, this is a 360 deg empty angle range
			emptyAngles[a][1] += 2*Math.PI;
		}
		let rangeSize = emptyAngles[a][1] - emptyAngles[a][0];
		maxNumberLoops[a] = Math.floor(rangeSize / (1.5*minAngle));
	}
	
	let loopsAvailable = maxNumberLoops.slice(); //copy of maxNumberLoops, but can subtract loops already drawn from it
		
	//Select where loops will go
	//algorithm:
	//pick an empty angle range with the greatest # loops available, draw a loop there
	//each time draw a loop in an angle range, subtract one from the loopsAvailable entry for that angle range
	//repeat
	
	let nLoopsWithoutSpace = 0; //keep track of how many loops can't fit without overlap
	//if there's not enough space, we will overlap with straight edges and not prev drawn loops. If not enough space for that, will evenly split 360deg among loops.
	
	for(let i=0; i<nLoops; i++){ // <= in condition so that there's an iteration for the loop to be drawn as well
		let maxLoopsAvailable = Math.max.apply(this, loopsAvailable);
		
		if(maxLoopsAvailable === 0){
			nLoopsWithoutSpace = nLoops - i;
			break;
		}
		
		let index = loopsAvailable.indexOf(maxLoopsAvailable);
		loopsAvailable[index]--;
	}
	
	//loop through emptyAngles, determine the starting theta and angle of each loop in each angle range
	for(let a=0; a<emptyAngles.length; a++){
		//determine number of loops in this angle range
		let n = maxNumberLoops[a] - loopsAvailable[a];
		
		if(n === 0){continue} //don't do anything if there are no loops here
		
		//determine the angle of each of the loops - make as large as possible w/o going over defaultAngle
		let rangeSize = emptyAngles[a][1] - emptyAngles[a][0];
		let loopRange = rangeSize / n; //How much space the loop is allowed to take - includes loop + gap + extra space if the loop's angle was limited by defaultAngle
		let ang = Math.min(loopRange*(2/3), defaultAngle);
		
		//get theta of each loop, and add to output array
		for(let loop=0; loop<n; loop++){
			//determine center of the loop - get to start of this loop's range, then add half a gap before starting the loop. There will be a half gap left at the end of the loop's range.
			let loopCenter = emptyAngles[a][0] + (loop*loopRange + (loop+1)*loopRange)/2;
			
			//determine starting theta (clockwise of center of loop)
			let theta = loopCenter - 0.5*ang;
			
			output.push({theta:theta, angle:ang});
		}
	}
	
	if(nLoopsWithoutSpace > 0){		
		if(!overlap){ //means this was the initial call, see if there's space if we allow loops to overlap with straight edges
			//store angle ranges where loops have been drawn (+gaps)
			let loopAngleRanges = [];
			for(let i=0; i<output.length; i++){
				let theta = output[i].theta;
				let ang = output[i].angle;
				loopAngleRanges.push([theta-0.25*ang, theta+1.25*ang]);
			}
			
			let emptyAnglesLoopsOnly = getEmptyAngles(undefined,undefined,loopAngleRanges);
			
			return loopLocations(emptyAnglesLoopsOnly, nLoopsWithoutSpace, defaultAngle, true, output);
		}
		else { //there's not space, even allowing overlap with straight edges - revert to just splitting the 360deg among loops
			output = [];
			nLoops = knownLoopLocations.length + nLoops; //also get the loops also known locations
			let ang = (2/3) * 2*Math.PI/nLoops;
			for(let i=0; i<nLoops; i++){
				output.push({theta: 1.5*ang*i, angle:ang});
			}
			return output;
		}
	}
	
	//return stuff
	if(!overlap){
		return output;
	} else {
		return knownLoopLocations.concat(output);
	}
}