var report = {
	distanceToEnd:0,
	totalTime:0,
}
function solveMaze(maze,mode="mazeCreator"){ //default mode is mazeCreator
	var t0 = performance.now();
	if(typeof maze !== "object") {return}
		
	//if maze creator, make sure toggleCell is toggling 0 to 1, not start/end location
	if((mode==="mazeCreator") && (clickType!=="normal")) {return "Delselect start/end location button and try again."}
	
	
	
	
	
		//will store best path in maze (any unblocked cells after ruleOutCells() executes), make it different than master maze array
	var maze = makeDeepCopy(maze);
	
	var nOfR = maze.length; //number of rows
	var nOfC = maze[0].length; //number of cols
	
	var iM = 10; //initial (aka 'start') marker, used in distanceToEnd() and ruleOutCells(), should be higher than any special data numbers (-1,0,1,2,3)
				//(it's the lowest distance marker, each expansion from the start will be marked with a marker one larger)
	
	//determine start and end coords
	var start,end;
		//search for start and end
	for(var R=0; R<nOfR; R++){
		for(var C=0; C<nOfC; C++){
			if(maze[R][C] === 2){start = [R,C]}
			if(maze[R][C] === 3){end = [R,C]}
		}
	}
		//if didn't find start or end, throw error saying so
	if(start===undefined || end===undefined){
		throw new Error("Failed to find start or end when evaluating distanceToEnd.");
		return; //statement shouldn't be necessary, but here in case
	}
	
	
	
	
	
	function nOfAdjBlocked(r,c,mazeData) {
		//testing function returns blocked ('1') for all cells that aren't 0,2,or 3
		var testIt = function(cell) {
			if(cell===0 || cell===2 || cell===3) {return 0}
			else{return 1} //a cell value of -1 (route marker) should also be interpreted as blocked
		}
		
		var up=0,
			left=0,
			right=0,
			down=0;
		
			//test for all 4 adjacent cells
		try{up += testIt(mazeData[r - 1][c])} catch(err){up++} //up
		try{left += testIt(mazeData[r][c - 1])} catch(err){left++} //left
		try{right += testIt(mazeData[r][c + 1])} catch(err){right++} //right
		try{down += testIt(mazeData[r + 1][c])} catch(err){down++} //down
			//if attempting to access the cell creates an error (outside of maze), count it as a blocked spot
			//FYI: catch requires an argument, that's why it's there
		
		var nOfAdj = up + left + right + down; //number of adjacent blocked cells
		
		return [nOfAdj,up,left,right,down];
	}
	
	
	
	
	function distanceToEnd(mazeData,st,ed){ //st:startCoords, ed:endCoords
		var D0 = performance.now();
			//make deep copy (depth=2) of mazeData so we don't screw up the maze array inputed
		mazeData = makeDeepCopy(mazeData);
		
			//determine value of end cell (b/c it doesn't have to be 3, I can run this function from end to start)
		var edCellVal = mazeData[ed[0]][ed[1]];
		
		var n = iM; //n is a marker that gets incremented for each expansion
		
			//set start to initial marker value
		mazeData[st[0]][st[1]] = n;
		
		var expanded = false; //used to check if reached end of expansion, and still didn't reach end, if so, unsolvable -> return Infinity
		while(true){ //each time loop runs, expansion of 1 unit
			expanded = false; //assume false until open space found
			n++;
				//loop through cells
			for(var r=0; r<nOfR; r++){
				for(var c=0; c<nOfC; c++){
					if(mazeData[r][c]===(n-1)){ //cells from previous expansion
							//any open(start, blank, or end) adjacent cells, set to n
						var result = nOfAdjBlocked(r,c,mazeData);
						if(result[1]===0){mazeData[r-1][c] = n; expanded=true} //up
						if(result[2]===0){mazeData[r][c-1] = n; expanded=true} //left
						if(result[3]===0){mazeData[r][c+1] = n; expanded=true} //right
						if(result[4]===0){mazeData[r+1][c] = n; expanded=true} //down
					}
				}
			}
				//check if end cell was 'consumed' by that expansion
			if(mazeData[ed[0]][ed[1]] !== edCellVal){break}
				//if nowhere to expand, (and end cell wasn't consumed), means unsolvable -> return Infinity
			else if(expanded === false){return Infinity}
		}
		var D1 = performance.now();
		report.distanceToEnd += (D1-D0);
		return [n-iM, mazeData];
	}
	
		//do calculations w/ distanceToEnd()
	var distanceToEndResult = distanceToEnd(maze,start,end);
		if(distanceToEndResult === Infinity){return "Unsolvable maze."}
	var absDist = distanceToEndResult[0]; //minimum distance
	var mazeMS = distanceToEndResult[1]; //marker maze, from start
	
		//do distanceToEnd, but go from end to start (flip the arguments --> 'distance to start')
	var mazeME = distanceToEnd(maze,end,start)[1]; //marker maze, from end
	
	
	function ruleOutCells(mazeMS,mazeME){ //marker maze
		var r0 = performance.now();
		
		//iterate through cells
		for(var r=0; r<nOfR; r++){
			for(var c=0; c<nOfC; c++){
					//block cells w/o a marker
				if( (mazeMS[r][c] < iM || mazeME[r][c] < iM) || //block cells w/o a marker
					(((mazeMS[r][c]-iM) + (mazeME[r][c]-iM)) !== absDist) ){//cells that are part of shortest path should have:
																//(distance from start + distance from end === absDist)
																//block cells that don't
					mazeMS[r][c] = 1;
					mazeME[r][c] = 1;
					maze[r][c] = 1;
				}
			}
		}
	}
	
	function displayPath(mazeData){
		for(var r=0; r<nOfR; r++){
			for(var c=0; c<nOfC; c++){
				var val = mazeData[r][c];
				var dispVal = maze[r][c];
				if(mazeData[r][c] === 0){
					document.getElementById(r+"a"+c).style.backgroundColor = "rgba(0,255,0,0.5)";
				}
			}
		}
	}
	
	
	function makeDeepCopy(array){
		return array.map(function(arrElement){//need to copy multiple dimensions, i.e. a deep copy of depth 2; map() creates a new array
											//by executing a function on each item in the executing array
			return arrElement.slice();
		});
	}
	
	//execute functions!
	ruleOutCells(mazeMS,mazeME);
	displayPath(maze);
	
	var t1 = performance.now();
	report.totalTime = t1-t0;
}

function resetMaze(maze){
	var nRows = maze.length;
	var nCols = maze[0].length;
	
	for(var r=0; r<nRows; r++){
		for(var c=0; c<nCols; c++){
			var cell = document.getElementById(r+"a"+c);
			if(maze[r][c] === 0) {cell.style.backgroundColor = "white"}
			if(maze[r][c] === 1) {cell.style.backgroundColor = "gray"}
			if(maze[r][c] === 2) {cell.style.backgroundColor = "green"}
			if(maze[r][c] === 3) {cell.style.backgroundColor = "red"}
		}
	}
}