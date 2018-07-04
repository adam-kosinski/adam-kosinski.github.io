//initiation/control center function for nonogram solving
function solve(){
	if(!nonogramLoaded || dialogOpen){return}
	
	var nOfRows = nonogram.length;
	var nOfCols = nonogram[0].length;
	
	//shift each of the rows and cols
	for(var row=0; row<nOfRows; row++){
		shift(clues.rows[row],{startCoord:[row,0],endCoord:[row,nOfCols-1]});
	}
	for(var col=0; col<nOfCols; col++){
		shift(clues.cols[col],{startCoord:[0,col],endCoord:[nOfRows-1,col]});
	}
}





function shift(groups,range,groupsArrayPassed=false,rangeArray=undefined,offsetStartCoord=undefined){
	//'groups' is a list (unidimensional array) of the clues to fit into the range
	//'range' is an object with properties: startCoord:[r,c], endCoord:[r,c]
	//if groupsArrayPassed is true, interpret 'groups' to be groupsArray (see var below) instead of converting it - easier for recursive calling
	//rangeArray is there to allow passing of the rangeArray to the function when called recursively
	//offsetStartCoord is the start coord for recursive calling located somewhere in rangeArray, not at the beginning
	
	//determine direction and length of range (row or col)
	var dir;
	var length;
	if(range.startCoord[0] === range.endCoord[0]){
		dir = "row";
		length = range.endCoord[1] - range.startCoord[1] + 1;
	}
	else if(range.startCoord[1] === range.endCoord[1]){
		dir = "col";
		length = range.endCoord[0] - range.startCoord[0] + 1;
	}
	else {
		alert("shift(): Non-linear range passed.");
		return;
	}
		
	
	//create an array representing the available space - assume all blocked, then remove uncertain blocks later
	if(rangeArray === undefined){
		rangeArray = array(length, 1);
	}
	
	//create an array representing the groups, squished as close together as possible for maximum flexibility
	var groupsArray = [];
	if(groupsArrayPassed){groupsArray = groups}
	else {
			//iterate through each group
		for(var i=0, nGroups=groups.length; i<nGroups; i++){
			for(var counter=0, groupLength=groups[i]; counter<groupLength; counter++){
				groupsArray.push(1);
			}
			console.log("groupLength",groupLength);
			if(i+1 < nGroups){groupsArray.push(0)} //when i+1 equals nGroups, this is the last iteration of the loop, so don't add a space onto the end
		}
	}
		
	//make sure range can fit the groups - if not, it's not necessarily an error b/c recursive looping procedure may cause this - just stop the function
	if(rangeArray.length < groupsArray.length){
		return;
	}
	
	
	//shift groupsArray over rangeArray
		//iterate through possible offsets
	for(var offset=0, maxOffset=rangeArray.length-groupsArray.length; offset<=maxOffset; offset++){
		//check if this offset jibes with the current nonogram, take necessary recursive action if not
		var jibes = true; //assume true until find false
			//get r and c references so can reference the nonogram
		var r = range.startCoord[0];
		var c = range.startCoord[1];
			//iterate through the range and check
		for(var i=0; i<length; i++, dir==="row"? c++ : r++){
			if(nonogram[r][c] === 1 && (groupsArray[i-offset]===undefined || groupsArray[i-offset] !== 1)){
				jibes = false;
				if(dbg){debugger}
					//call shift(), shifting everything after the offending point to find something that works
				if(groupsArray[i-offset] !== undefined){ //this doesn't exclude anything, but makes the function callable
					if(!groupsArrayPassed){
						var newStartCoord = dir==="row"? [r,c+1]
						shift(groupsArray.slice(i-offset+1),{startCoord:[],endCoord:range.endCoord},true,rangeArray);
					}
				}
				
			} else if(nonogram[r][c] === -1 && (groupsArray[i-offset]===undefined? false : groupsArray[i-offset] !== 0)){
				jibes = false;
				
			}
		}
			//if this offset does jibe with the current nonogram, iterate through rangeArray and make spots 0 if that's possible
		if(jibes){
			for(var i=0; i<length; i++){
				if(groupsArray[i-offset] === 0 || groupsArray[i-offset] === undefined){
					rangeArray[i] = 0;
				}
			}
		} //else, the loops starts again and the offset increments
	}
	
	//mark the result on the nonogram
		//reset r and c to start coords
	r = range.startCoord[0];
	c = range.startCoord[1];
	for(var i=0, rArrLen=rangeArray.length; i<rArrLen; i++){
		
		//enter the data
		if(rangeArray[i] === 1){
			nonogram[r][c] = 1;
			var cell = document.getElementById(r+"-"+c);
			cell.style.backgroundColor = "black";
		}
		
		if(dir === "row"){c++}
		if(dir === "col"){r++}
	}
}