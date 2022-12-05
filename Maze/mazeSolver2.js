var STOP = false;
var report = {
	ruleOutCells:0,
	distanceToEnd:0,
	deadEnds:0,
	totalTime:0,
	preliminary:0
}
function solveMaze(maze,mode="mazeCreator"){ //default mode is mazeCreator
	var t0 = performance.now();
	if(typeof maze !== "object") {return}
		
	//if maze creator, make sure toggleCell is toggling 0 to 1, not start/end location
	if((mode==="mazeCreator") && (clickType!=="normal")) {return "Delselect start/end location button and try again."}
	
	
	
	
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
	
	var nOfAdjBlocked = function(r,c,mazeData) {
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
	
	var blockDeadEnds = function(mazeData) {
		if(STOP){return}
		var b = 0; //keeps track of dead ends blocked out, if 0 at end, means no more can be done
		//iterate through each cell
		for(var r=0; r<nOfR; r++){
			for(var c=0; c<nOfC; c++){
					//only block out completely white squares
				if(mazeData[r][c] === 0) {
					if(nOfAdjBlocked(r,c,mazeData)[0] >= 3) {
						mazeData[r][c] = 1;
						b++;
					}
				}
			}
		}
		
		if(b > 0) {blockDeadEnds(mazeData)}
	}
	
	
	var blockLargerDeadEnds = function(mazeData) {
		if(STOP) {return}
		
		var b = 0; //same purpose as above
		
		//iterate through all cells
		for(var r=0; r<nOfR; r++) {
			for(var c=0; c<nOfC; c++) {
				
				//identify open blocks (meaning white rectangles)
				var isBlock = true; //assume true until shown false
					//iterate through potential block
				for(var x=0; x<2; x++) {
					for(var y=0; y<2; y++) {
						try{if(mazeData[r + x][c + y] !== 0){isBlock = false}}
						catch(err) {isBlock = false}
					}
				}
				
				if(!isBlock) {continue} //if not a block, check next cell
					//if is block, block one cell with two adjacent walls per block, if such one exists
				if(isBlock) {
					
					//iterate through block
					iterationLabel: //labels allow breaking out of nested loops
					for(var y=0; y<2; y++) {
						for(var x=0; x<2; x++) {
							
							if(nOfAdjBlocked(r+y, c+x, mazeData)[0] >= 2) { //really should only ever be 2 max
								mazeData[r+y][c+x] = 1; //block corner of 2x2 block that has 2 adjacent blocked cells
								b++;
								break iterationLabel; //only should toggle one of the 4 cells in the 2x2 block
							}
						}
					}
				}
			}
		}
		
		if(b > 0) {
			blockDeadEnds(mazeData);
			blockLargerDeadEnds(mazeData);
		}
	}
	
	
	
	var distanceToEnd = function(mazeData,st,ed){ //st:startCoords, ed:endCoords
		var D0 = performance.now();
			//make deep copy (depth=2) of mazeData so we don't screw up the maze array inputed
		mazeData = makeDeepCopy(mazeData);
		
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
			if(mazeData[ed[0]][ed[1]] !== 3){break}
				//if nowhere to expand, (and end cell wasn't consumed), means unsolvable -> return Infinity
			else if(expanded === false){return Infinity}
		}
		var D1 = performance.now();
		report.distanceToEnd += (D1-D0);
		return [n-iM, mazeData];
	}
	
	var distanceToEndResult = distanceToEnd(maze,start,end);
	var absDist = distanceToEndResult[0];
		if(absDist === Infinity){return "Unsolvable maze."}
	var mazeM = distanceToEndResult[1];
	
	
	var ruleOutCells = function(mazeM){ //marker maze
		var r0 = performance.now();
		
		//block cells w/o a marker
		for(var r=0; r<nOfR; r++){
			for(var c=0; c<nOfC; c++){
				if(mazeM[r][c] < iM){
					mazeM[r][c] = 1;
					maze[r][c] = 1;
				}
			}
		}
		//loop expansion distance up to distance of the minimum path length (absDist)
		for(var i=1; i<absDist; i++){
			
			//iterate through mazeM
			for(var r=0; r<nOfR; r++){
				for(var c=0; c<nOfC; c++){
					//if cell has marker corresponding to current expansion
					if(mazeM[r][c] === iM+i){
						//find distance from current cell, if cell is part of a shortest path, it should be: total distance - expansion distance
						//if it's not, block the cell (in this array and in the maze array) because it's not part of a shortest path
						if(distanceToEnd(maze,[r,c],end)[0] !== (absDist - i)){
							mazeM[r][c] = 1;
							maze[r][c] = 1;
						}
					}
				}
			}
		}
		var r1 = performance.now();
		report.ruleOutCells += (r1-r0);
	}
	
	
	function makeDeepCopy(array){
		return array.map(function(arrElement){//need to copy multiple dimensions, i.e. a deep copy of depth 2; map() creates a new array
											//by executing a function on each item in the executing array
			return arrElement.slice();
		});
	}
	var PATHS = []; //store generated paths here
	var Path = function(distance,mazeData){
		this.distance = distance;
		this.mazeData = makeDeepCopy(mazeData);
	}
	
	var d0 = performance.now();
	//execute functions
	blockDeadEnds(maze);
	blockLargerDeadEnds(maze);
	
	var d1 = performance.now();
	
	//identify corridors of start cell
	//var gCellCorridors = mazeC[gCellR][gCellC];
	ruleOutCells(mazeM);
	blockDeadEnds(maze);
	blockLargerDeadEnds(maze);
	
	var t1 = performance.now();
	report.totalTime = t1-t0;
	report.deadEnds = d1-d0;
	report.preliminary = d0-t0;
}

function displayPath(mazeData,maze){
	var nRows = mazeData.length;
	var nCols = mazeData[0].length;
	console.log(nRows,nCols)
	for(var r=0; r<nRows; r++){
		for(var c=0; c<nCols; c++){
			var val = mazeData[r][c];
			var dispVal = maze[r][c];
			if(mazeData[r][c] === -1 && maze[r][c] === 0){
				document.getElementById(r+"a"+c).style.backgroundColor = "rgba(0,255,0,0.25)";
			}
		}
	}
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