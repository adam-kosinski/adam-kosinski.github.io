function uniquefy(itemList){ //takes an array of 3d arrays (representing a rectangular prism in space) as input
	var returnList = [];
	
	//check if item at index of 0 is equivalent to any of other items, if so, remove other item. Splice out index and add to return list. Repeat until itemList is emptied.
	while(itemList.length > 0){		
		var a = itemList[0];
		
		//search for duplicates
		for(var i=1; i<itemList.length; i++){ //itemList.length is dynamic, need to evaluate length each time
			var isEqual = true; //assume equal unless find a difference
			
			var b = itemList[i];
			
			//check if same dimensions
			if(a.length !== b.length){isEqual = false}
			else if(a[0].length !== b[0].length){isEqual = false}
			else if(a[0][0].length !== b[0][0].length){isEqual = false}
			else { //same dimensions
				
				//loop through tiers, rows, and cols, check if same data
				iteration:
				for(var t=0,nT=a.length; t<nT; t++){
					for(var r=0,nR=a[0].length; r<nR; r++){
						for(var c=0,nC=a[0][0].length; c<nC; c++){
							if(a[t][r][c] !== b[t][r][c]){
								isEqual = false;
								break iteration;
							}
						}
					}
				}
			}
			
			if(isEqual){ //remove duplicate
				itemList.splice(i,1);
				i--; //so that i will reference next item next time around and not skip one
			}
		}
		
		//move over item into returnList
		returnList.push(itemList.splice(0,1)[0]);
	}
	
	return returnList;
}

/*
function getIdenticalParts(){
	var listOfIdenticalPairs = [];
	
	//loop through pairs of parts
	for(var a=0; a<parts.length-1; a++){
		for(var b=a+1; b<parts.length; b++){
			//loop through orientations of each part, compare to see if same using uniquefy()
			orientationLoop:
			for(var aO=0; aO<partsOrientations[a].length; aO++){
				for(var bO=0; bO<partsOrientations[b].length; bO++){
					var uniquefyResult = uniquefy([partsOrientations[a][aO],partsOrientations[b][bO]]); //orientations are coded using 0s and 1s; identical orientations of identical parts should appear identical
						//if the orientations are identical, means the parts are identical, stop comparing these two parts
					if(uniquefyResult.length === 1){
						listOfIdenticalPairs.push([a,b]); //there aren't scope problems with a and b changing after being added to listOfIdenticalPairs
						break orientationLoop;
					}
				}
			}
		}
	}
	return listOfIdenticalPairs;
}
*/
var log = "";
function isPlacementRedundant(assembly,part){ //'part' is part number
	console.log("r_p"+part);
	
	//check to see if where we're placing a part is where a different identical part is placed in an existing solution
	//PLAN: iterate through solutions
	//		iterate through assembly, look for cubes of the given part
	//		see if all of them coincide with one specific/different part in the solution
	//		see if number of coincidences match number of cubes of both parts
	//		if so, placement is redundant
	
	if(solutions.length === 0){return false} //not redundant b/c no solutions to compare it to
	log+=part+"("+solutions.length+"), "
	for(var s=0,sL=solutions.length; s<sL; s++){
		//if(sL===2){debugger}
		var nOfCoincidences = 0;
		var solutionPart = undefined; //part number of corresponding part in solution
		
		for(var t=0,nTiers=assembly.length; t<nTiers; t++){
			for(var r=0,nRows=assembly[0].length; r<nRows; r++){
				for(var c=0,nCols=assembly[0][0].length; c<nCols; c++){
					if(assembly[t][r][c] === "p"+part){
						var solutionCell = Number(solutions[s][t][r][c].slice(1)); //all solution cells have strings in them
						
						if(solutionPart === undefined){ //if solutionPart not yet set, set it
							solutionPart = solutionCell;
							nOfCoincidences++;
							if(part === solutionPart){return false} //not redundant b/c same part
						}
						else{ //if solutionPart already defined
							if(solutionCell !== solutionPart){return false} //not redundant b/c multiple solution parts in the same location as proposed placement for the part
							else{ //if solutionCell === solutionPart
								nOfCoincidences++;
							}
						}
					}
				}
			}
		}
		
		if(nOfCoincidences !== partsInfo[part].nOfCubes || nOfCoincidences !== partsInfo[solutionPart].nOfCubes){return false} //not redundant b/c not identical parts
	}
	
	//if not determined to be not redundant, it's redundant
	return true;
}