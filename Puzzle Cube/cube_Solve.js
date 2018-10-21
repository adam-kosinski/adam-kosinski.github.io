function solve(){
	console.log("solving...");
	
	GUI_Editable = false;
	
	if(!isInputValid()){GUI_Editable = true; return}
	
	resetGlobalVariables(); //in case solving twice before reloading
	
	var assembly = arrayWithDimensions(puzzleH,puzzleL,puzzleW);
	
	/*Determine
	-order of puzzle part assembly - parts with more cubes go first -> fill an array with part indices during iteration, sort indices after iteration
	-orientations of each part
	-cube locations of each part
	*/
	
	//loop through parts
	for(var i=0,L=parts.length; i<L; i++){
		assemblyOrder.push(i);
		
		//get orientations for this part
		var orientations = getOrientations(parts[i]);
		partsOrientations.push(orientations);
		
		//get cube locations for all the orientations of this part
		var partOrientationsCubeLocations = []; //stores cube locations for this part's orientations
		for(var orient=0,nOrients=orientations.length; orient<nOrients; orient++){ //get cube locations for each orientation
			partOrientationsCubeLocations.push(getCubeLocations(orientations[orient]));
		}
		cubeLocations.push(partOrientationsCubeLocations);
	}
	//sort assemblyOrder
	assemblyOrder.sort(function(a,b){ //sort numerically descending based on number of cubes in part
		return partsInfo[b].nOfCubes - partsInfo[a].nOfCubes
	});
	
	
	//call placePart to start recursive sequence
	placePart(assembly,0);
	
	console.log(solutions);
}

function placePart(assembly,partsPlaced=0){ //'partsPlaced' is also the index in assemblyOrder for the next part to be placed
	var assembly = deepCopy(assembly);
	var part = assemblyOrder[partsPlaced]; //get part number, store in 'part'
	
	//get orientations to test; if first part, only use initial orientation
	var orientations = partsPlaced===0 ? [partsOrientations[part][0]] : partsOrientations[part];
	
	//iterate through orientations
	for(var o=0,nOrient=orientations.length; o<nOrient; o++){
		
		//get nTiers, nRows, nCols
		var nTiers = partsOrientations[part][o].length;
		var nRows = partsOrientations[part][o][0].length;
		var nCols = partsOrientations[part][o][0][0].length;
		
		//iterate through positions, based on x,y,and z offset
		for(var yOffset=0,maxYOffset=puzzleH-nTiers; yOffset<=maxYOffset; yOffset++){
			for(var zOffset=0,maxZOffset=puzzleL-nRows; zOffset<=maxZOffset; zOffset++){
				for(var xOffset=0,maxXOffset=puzzleW-nCols; xOffset<=maxXOffset; xOffset++){
					
					var thisAssembly = deepCopy(assembly); //to allow cell-marking for this position that's separate from other positions
					
					//iterate through cubes in the part, testing if the spot in the assembly is occupied for this current position
					var cubes = cubeLocations[part][o];
					var noConflict = true; //assume no overlap unless found one
					for(var cube=0,nCubes=cubes.length; cube<nCubes; cube++){
						//get tier, row, and col of cube in the part
						var t = cubes[cube][0];
						var r = cubes[cube][1];
						var c = cubes[cube][2];
						
						//test to see if where the cube would end up with current position is occupied; unoccupied spots are an empty string
						if(thisAssembly[t+yOffset][r+zOffset][c+xOffset] !== 0){ //means it's occupied
							noConflict = false; //there was a conflict
							break; //stop iterating through the cubes of this part, move on to next position
						} else {
							//mark this assembly spot as being occupied by one of this part's cubes
							thisAssembly[t+yOffset][r+zOffset][c+xOffset] = "p"+part;
						}
					}
					if(solutions.length===2){debugger;}
					//if no conflict, and no redundant placing (placing an part where a different, identical part goes in an existing solution)
					if(noConflict && !isPlacementRedundant(thisAssembly,part)){ //call placePart() on assembly for the next part
						if(partsPlaced+1 === parts.length){solutions.push(thisAssembly)} //if placed last part, submit assembly to the solutions list
						else{placePart(thisAssembly,partsPlaced+1)} //otherwise, place next part
					}
				}
			}
		}
	}
	
	GUI_Editable = true;
}