//initiation/control center function for nonogram solving
function solve(initialCall=true,testingGuess=false){
	//initialCall is signifies whether this function call was the initial one or a recursive call
	//testingGuess signifies if this is being called recursively b/c the puzzle called for guessing and searching for a contradiction - impacts how to call finishedSolving()
	
	if(!nonogramLoaded || dialogOpen){return}
	solving = true;
	
	var nOfRows = nonogram.length;
	var nOfCols = nonogram[0].length;
	
	//first clear the nonogram - if don't, the program will preserve mistakes made by the user
	if(initialCall){
		for(var r=0; r<nOfRows; r++){
			for(var c=0; c<nOfCols; c++){
				nonogram[r][c] = 0;
				document.getElementById(r+"-"+c).style.backgroundColor = "white";
				document.getElementById(r+"-"+c).innerHTML = "";
			}
		}
		solutions = []; //also reset this
	}
	
	//solve using basic methods
	while(anythingChanged){ //anythingChanged originally true
		anythingChanged = false;
		
		//shift each of the rows and cols
		for(var row=0; row<nOfRows; row++){
			if(contradiction){break}
			shift(clues.rows[row],"row"+row);
		}
		for(var col=0; col<nOfCols; col++){
			if(contradiction){break}
			shift(clues.cols[col],"col"+col);
		}
	}
	anythingChanged = true; //reset for the next time this flag needs to be used (possibly on a recursive call of solve())
	
	//check for contradiction
	if(contradiction){
		contradiction = false; //reset, since it's a global variable
		return "contradiction"; //this will let the function that called solve() know that a contradiction was found
	}
	
	//check if found a solution (all spaces either blocked or an X)
	var emptySpacesPresent = false; //assume false until find an empty space
	parentLoop:
	for(var r=0; r<nOfRows; r++){
		for(var c=0; c<nOfCols; c++){
			if(nonogram[r][c] === 0){
				emptySpacesPresent = true;
				break parentLoop;
			}
		}
	}
	if(!emptySpacesPresent){
		if(!testingGuess){
			solutions.push(deepCopy(nonogram));
			finishedSolving();
		}
		else {
			solutions.push(deepCopy(nonogram));
		}
		return;
	}
	//from now on, we have the knowledge that empty spaces are present - the nonogram isn't finished
	
	//use advanced logic - make a guess and see if results in a contradiction - for all empty spots, guess with both a block and an X to be comprehensive
	var savedNonogram = deepCopy(nonogram); //store current state so we can come back to it
	var whatToGuess = 1;
	parentLoop:
	while(whatToGuess === 1){ //the 1st time this runs, we're guessing that there's a block, and then we set whatToGuess to -1, to guess X the 2nd time
		for(var r=0; r<nOfRows; r++){
			for(var c=0; c<nOfCols; c++){
				if(nonogram[r][c] === 0){
					nonogram[r][c] = whatToGuess; //guess
					
					//compare nonogram to solutions to see if this guess will form duplicates
					if(nonogramIsDuplicate(r,c)){ //see below
						//restore nonogram and move on to guessing next cell
						nonogram[r][c] = 0;
						continue;
					}
					
					//call solve() recursively and react appropriately to contradictions
					var result = solve(false,true);
					if(result === "contradiction"){
						nonogram = deepCopy(savedNonogram);
						nonogram[r][c] = whatToGuess * -1; //if guessed 1 and got a contradiction, must be -1, and vice versa
						
						updateDisplay(); //utilities.js
						solve(false); //continue solving with this new 100% certain information
						break parentLoop;
					}
					else { //no contradiction, meaning that there is a valid solution with this guess; continue guessing
						nonogram = deepCopy(savedNonogram);
						updateDisplay();
					}
				}
			}
		}
		whatToGuess = -1;
	}
	
	if(initialCall){finishedSolving()}
}


function nonogramIsDuplicate(r,c){
	//this function doesn't technically check for duplicates, only if the r,c value in the nonogram is the same in any of the found solutions
	//   - which essentially means continuing with the current nonogram will make duplicate solutions
	
	if(solutions.length === 0){return false}
	for(var s=0,nSol=solutions.length; s<nSol; s++){
		if(solutions[s][r][c] === nonogram[r][c]){
			return true;
		}
	}
	return false;
}


function finishedSolving(){ //used to message user about status
	if(solutions.length === 1){
		console.log("Done Solving!");
	} else if(solutions.length > 1){
		console.log(solutions.length+" Solutions");
	} else if(solutions.length === 0){
		console.log("No solution found.")
	}
	solving = false;
}




function shift(groups,range){
	//'groups' is a list (unidimensional array) of the clues to fit into the range
	//'range' is a string of the form "row2" or "col4"
	
	//determine direction, length, and location of range
	var dir = range.substring(0,3);
	var length;
	if(dir === "row"){length = nonogram[0].length}
	else if(dir === "col"){length = nonogram.length}
	else {
		console.log("shift(): range ("+range+") is of inappropriate format");
		return;
	}
	var index = parseInt(range.substring(3));
	
	//create an array representing the current state of the range on the nonogram, and a copy of it to store our results before reporting to the nonogram
	var rangeArray = [];
	if(dir==="row"){rangeArray = nonogram[index].slice()}
	else {
		for(var r=0; r<length; r++){ //iterate through the col
			rangeArray.push(nonogram[r][index]);
		}
	}
	var result = rangeArray.slice();
	
	//create an array representing the groups, squished as close together as possible for maximum flexibility
	var groupsArray = [];
		//iterate through each group
	for(var i=0, nGroups=groups.length; i<nGroups; i++){
		for(var counter=0, groupLength=groups[i]; counter<groupLength; counter++){
			groupsArray.push(1);
		}
		if(i+1 < nGroups){groupsArray.push(0)} //when i+1 equals nGroups, this is the last iteration of the loop, so don't add a space onto the end
	}
		
	//make sure range can fit the groups
	if(rangeArray.length < groupsArray.length){
		console.log("shift(): Groups larger than range ("+range+") - groups:"+groupsArray.length+" range:"+length);
		return;
	}
	
	//console.log("rangeArray:",rangeArray);
	//console.log("groupsArray:",groupsArray);
	
	
	//test if each spot in rangeArray that's not already defined can be blocked or can be empty, if can't be blocked mark w/ X, if can't be empty mark w/ block
	for(var i=0; i<length; i++){
		if(rangeArray[i] !== 0){continue} //if it's already certain what this cell is, don't mess with it
		
		var rangeArrayCopy = rangeArray.slice(); //need to make a copy so we can make an assumption by editing it, then seeing if this assumption is possible
		
		//test if can be blocked
		rangeArrayCopy[i] = 1;
		//console.log("TESTING IF INDEX "+i+" CAN BE BLOCKED");
		var canBeBlocked = canSatisfy(rangeArrayCopy,groupsArray);
		if(!canBeBlocked){
			result[i] = -1; //if can't be blocked, mark w/ X
			anythingChanged = true; //we made an edit to the nonogram, so something changed during this solving round
		}
		
		//test if can be empty
		rangeArrayCopy[i] = -1;
		//console.log("TESTING IF INDEX "+i+" CAN BE EMPTY");
		var canBeEmpty = canSatisfy(rangeArrayCopy,groupsArray);
		if(!canBeEmpty){
			result[i] = 1 //if can't be empty, mark w/ 1
			anythingChanged = true;
		}
		
		//check for contradiction
		if(!canBeEmpty && !canBeBlocked){contradiction = true;}
	}
	
	//console.log("result:",result);
	
	//record results on the nonogram
	var r = dir==="row" ? index : 0;
	var c = dir==="col" ? index : 0;
	
	for(var i=0; i<length; i++){
		var cell = document.getElementById(r+"-"+c);
		if(result[i] === -1){
			nonogram[r][c] = result[i];
			cell.style.backgroundColor = "white";
			cell.innerHTML = "&#10006;"; //'heavy multiplication sign'
		} else if(result[i] === 1){
			nonogram[r][c] = result[i];
			cell.style.backgroundColor = "black";
			cell.innerHTML = "";
		}
		
		
		if(dir==="row"){c++}
		if(dir==="col"){r++}
	}
}








function canSatisfy(arrayToSatisfy,groupsArray){ //function will return true or false
	//arrayToSatisfy is made of -1s, 0s, and 1s
	//groupsArray is made of 0s and 1s
	
	groupsArray = groupsArray.slice(); //groupsArray should be an independent reference
	
	//GOAL: find a satisfaction, namely the satisfaction w/ groups shifted least forward
	//console.log("arrayToSatisfy:",arrayToSatisfy);
	//iterate through arrayToSatisfy, clearing up conflicts where they arise
	for(var i=0, arrLen=arrayToSatisfy.length; i<arrLen; i++){
		
		//clear up conflicts
		
		if(arrayToSatisfy[i] === -1 && groupsArray[i] === 1){ //if should be a space but it's a block
			//console.log("Should be a space at index "+i+" but there's a block");
			//move offending group forward until satisfy
				//find first index of the group - this is where we will add zeros to shift the group forwards
			var firstIndexOfGroup;
			for(var j=i; j >= -1; j--){
				if(groupsArray[j] === 0 || groupsArray[j] === undefined){
					firstIndexOfGroup = j+1;
					break;
				}
			}
			//console.log("   firstIndexOfGroup:",firstIndexOfGroup);
			
			shiftGroupForward(groupsArray, firstIndexOfGroup, i-firstIndexOfGroup+1);
			
			//restart iteration, because we just messed with stuff that the iteration made conflict-free, meaning there might be new conflicts
			i = -1; //the i++ will set it back to 0
		}
		else if(arrayToSatisfy[i] === 1 && (groupsArray[i] === 0 || groupsArray[i] === undefined)){ //if should be a block but it's a space
			//console.log("Should be a block at index "+i+" but there's a space");
			if(groupsArray.length === 0){return false} //if there are no groups, you can't satisfy a space
			
			//move closest group behind this index up to this index
			var firstIndexOfGroup;
			var lastIndexOfGroup;
			var foundGroup = false;
			for(var j=i; j >= -1; j--){
				if((!foundGroup) && groupsArray[j] === 1){
					foundGroup = true;
					lastIndexOfGroup = j;
				}
				if((groupsArray[j] === 0 || groupsArray[j] === undefined) && foundGroup){
					firstIndexOfGroup = j+1;
					break;
				}
			}
			//console.log("   firstIndexOfGroup:",firstIndexOfGroup);
			//console.log("   lastIndexOfGroup:",lastIndexOfGroup);
			
			shiftGroupForward(groupsArray, firstIndexOfGroup, i-lastIndexOfGroup);
			
			//restart iteration, because we just messed with stuff that the iteration made conflict-free, meaning there might be new conflicts
			i = -1; //the i++ will set it back to 0
		}
		
		
		//test to see if can't satisfy
		if(groupsArray.length > arrLen){return false}
		else { //test to see if there's a 1 in arrayToSatisfy further back than the furthest back group
			for(var j=0; j<arrLen; j++){
				if(groupsArray[j] === 1){break} //as soon as we see a group, stop checking
				if(arrayToSatisfy[j] === 1){return false} //means we haven't seen a group but there's a 1
			}
		}
	}
	
	//if finished iteration without returning false, we found a satisfaction
	return true;
}



function shiftGroupForward(groupsArray, firstIndexOfGroup, amountToShift){	
	//find how much space is in front of the group if there's another group in front (so we don't shift the other group until necessary)
	//also find out the index right after the group ends
	//and we need to do this for all the excess spaces between ahead groups, not just the immediate next space
	var spaces = []; //fill this with objects detailing spaceLength and startIndex for each space
	var foundEmptySpace = false;
	for(var j=firstIndexOfGroup, gArrLen=groupsArray.length; j<gArrLen; j++){
		if(groupsArray[j] === 0){
			if(!foundEmptySpace){ //if at the beginning of a space
				spaces.push({spaceLength:0, startIndex:j});
			}
			foundEmptySpace = true;
			spaces[spaces.length-1].spaceLength++;
		}
		else if(foundEmptySpace && groupsArray[j] === 1){
			foundEmptySpace = false;
		}
	}
	//console.log("   spaces:",spaces);
	//console.log("   amountToShift:",amountToShift);
	
	
	//grab zeros from in front of group (but behind another group) if can, iterating from closest space between groups ahead to farthest space ahead
	var spacesGrabbed = 0;
	for(var s=0, nSpaces=spaces.length; s<nSpaces; s++){
		if(spaces[s].spaceLength > 1){
			var nSpacesToRemove = Math.min(amountToShift-spacesGrabbed, spaces[s].spaceLength-1);
			//console.log("space",s," nSpacesToRemove:",nSpacesToRemove);
			groupsArray.splice(spaces[s].startIndex-spacesGrabbed, nSpacesToRemove); //need to subtract spacesGrabbed from the startIndex b/c the startIndex changes after already splicing stuff out
			spacesGrabbed += nSpacesToRemove;
			if(spacesGrabbed >= amountToShift){break}
		}
	}
		
	//add zeros behind group to execute the shift
	var spliceArgs = [firstIndexOfGroup, 0];
	for(var n=0; n<amountToShift; n++){
		spliceArgs.push(0);
	}
	//console.log("     spliceArgs:",spliceArgs);
	groupsArray.splice.apply(groupsArray,spliceArgs);
	//console.log("    groupsArray:",groupsArray);
}