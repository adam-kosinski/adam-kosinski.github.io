var STOP = false;
var report = {
	deadEnds:0,
	preliminary:0,
	adventure:0,
	corridors:0,
	totalTime:0
}
function solveMaze(maze,mode){
	var t0 = performance.now();
	if(typeof maze !== "object") {return}
	
	if(!mode) {mode = "mazeCreator"}
	
	//if maze creator, make sure toggleCell is toggling 0 to 1, not start/end location
	if((mode==="mazeCreator") && (clickType!=="normal")) {return "Delselect start/end location button and try again."}
	
	var nOfR = maze.length; //number of rows
	var lOfR = maze[0].length; //length of row (aka number of columns)
	
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
		//if(STOP){return}
		var b = 0; //keeps track of dead ends blocked out, if 0 at end, means no more can be done
		//iterate through each cell
		for(var r=0; r<nOfR; r++){
			for(var c=0; c<lOfR; c++){
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
			for(var c=0; c<lOfR; c++) {
				
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
	
	
	
	var determineShortestDistance = function(mazeData,s,e){ //s:startCoords, e:endCoords
			//make deep copy (depth=2) of mazeData so we don't screw up the maze array, explanation of code in Path() function
		mazeData = mazeData.map(function(arrElement){
			return arrElement.slice();
		});
		
		var startN = 10; //for ease of changing value of n (initial value is needed in the return statement)
		var n = startN; //n is a marker that gets incremented for each expansion
		
		mazeData[s[0]][s[1]] = n;
		while(true){ //each time loop runs, expansion of 1 unit
			n++;
				//loop through cells
			for(var r=0; r<nOfR; r++){
				for(var c=0; c<lOfR; c++){
					if(mazeData[r][c]===(n-1)){ //cells from previous expansion
							//any open(start, blank, or end) adjacent cells, set to n
						var result = nOfAdjBlocked(r,c,mazeData);
						if(result[1]===0){mazeData[r-1][c] = n} //up
						if(result[2]===0){mazeData[r][c-1] = n} //left
						if(result[3]===0){mazeData[r][c+1] = n} //right
						if(result[4]===0){mazeData[r+1][c] = n} //down
					}
				}
			}
				//check if end cell was 'consumed' by that expansion
			if(mazeData[e[0]][e[1]] !== 3){break}
		}
		return n-startN;
	}
	
	
		//position coords of start and end
	var gCellR; //start is green cell
	var gCellC;
	var rCellR; //end is red cell
	var rCellC;
	
	var listOfCorridors = []; //like a reference book, allows program to identify all cells in a corridor more efficiently than iterating
	var mazeC = []; //copy of maze, but instead of number data, holds corridor data, fill it below
	//fill out mazeC and determine coords of start and end
		for(var R=0; R<nOfR; R++){
			var newRow = [];
			for(var C=0; C<lOfR; C++){
				newRow.push([]); //fill mazeC with empty arrays instead of numbers, these will be the lists of corridors a cell is in (max 2 corridors)
				if(maze[R][C] === 2){
					gCellR = R;
					gCellC = C;
				}
				if(maze[R][C] === 3) {
					rCellR = R;
					rCellC = C;
				}
			}
			mazeC.push(newRow);
		}
	
		//make sure start and end exist
	if(gCellR===undefined || gCellC===undefined ||rCellR===undefined || rCellC===undefined){return "Failed to locate start and end."}
	
	var identifyCorridors = function(){
		
		//define documenting function
		var documentCorridor = function(startR,startC,type){
			var cID = listOfCorridors.length; //corridor ID
			var thisCorridor = [];
			
			//loop through corridor
			for(var y=0,x=0;;){
					//calculate these once instead of multiple times
				var thisRow = startR + y;
				var thisCol = startC + x;
				
				//if cell blocked, end of corridor -> stop loop
				try{
					var val = maze[thisRow][thisCol];
					if(val!==0 && val!==2 && val!==3){break}
				} catch(err){break}
				
				//add corridor ID to corridors for that cell
				mazeC[thisRow][thisCol].push(cID);
				
				//add cell to corridor being documented
				thisCorridor.push([thisRow,thisCol]);
				
				//increment correct iterator
				if(type==="vertical"){y++}
				if(type==="horizontal"){x++}
			}
			listOfCorridors.push(thisCorridor);
		}
		//iterate through cells
		for(var r=0; r<nOfR; r++){
			for(var c=0; c<lOfR; c++){
					//if cell not blocked,
				if(maze[r][c]===0 || maze[r][c]===2 || maze[r][c]===3){
						//check if cell is at far left or far top of a corridor, if so, document that corridor
					var bSpots = nOfAdjBlocked(r,c,maze); //"blocked spots"; so don't run function more than once
					if(bSpots[1]===1 && bSpots[4]===0){documentCorridor(r,c,"vertical")} //if top blocked and below open
					if(bSpots[2]===1 && bSpots[3]===0){documentCorridor(r,c,"horizontal")} //if left blocked and right open
				}
			}
		}
	}
	
	var PATHS = []; //store generated paths
	var Path = function(distance,mazeData){
		this.distance = distance;
		this.mazeData = mazeData.map(function(arrElement){ //need to copy multiple dimensions, i.e. a deep copy of depth 2; map() creates a new array
															//by executing a function on each item in the executing array
			return arrElement.slice();
		});
	}
	var figureOutPossible = function(src,srcCor,path){ //source coords, source corridors, path object
		var result = nOfAdjBlocked(src[0],src[1],path.mazeData);
			//call makeAStep for each direction
		if(result[1]===0){makeAStep([src[0]-1,src[1]], src, srcCor, path)} //up
		if(result[2]===0){makeAStep([src[0],src[1]-1], src, srcCor, path)} //left
		if(result[3]===0){makeAStep([src[0],src[1]+1], src, srcCor, path)} //right
		if(result[4]===0){makeAStep([src[0]+1,src[1]], src, srcCor, path)} //down
		
		//if all are blocked, don't do anything, ending that particular path
	}
	
	var makeAStep = function(n, o, oc, path){ //new coords, old coords, old corridors, path object
			//make a separate copy of path (not a reference), and increase distance by one in the process
		path = new Path(path.distance + 1,path.mazeData);
		
			//check if went over shortest distance
		if(path.distance > minDistance){return} //abort path
		
			//mark old spot as -1, will be interpreted as blocked by nOfAdjBlocked
		path.mazeData[o[0]][o[1]] = -1;
		
			//check if solved, if so, make ending spot -1, add path to PATHS array
		if(path.mazeData[n[0]][n[1]] === 3){
			path.mazeData[n[0]][n[1]] = -1;
			PATHS.push(path);
			return;
		}
		
			//make new spot green(starting cell)
		path.mazeData[n[0]][n[1]] = 2;
		
			//identify corridors of new spot
		var nc = mazeC[n[0]][n[1]];
		
			//check each old corridor, if one of them isn't also a new corridor, means moved out of that corridor
		for(var oci=0,ocl=oc.length; oci<ocl; oci++){ //oci = oldCorridorIterator, ocl=oldCorridorLength
			var doesItMatch = false; //assume false, will change to true if find match
				//iterate through new corridors, check against each
			for(var nci=0,ncl=nc.length; nci<ncl; nci++){
				if(oc[oci]===nc[nci]){doesItMatch = true}
			}
				//if it doesn't match, block corridor (that has been exited)
			var c0 = performance.now();
			if(!doesItMatch){
				var corridor = listOfCorridors[oc[oci]]; //id of corridor is same thing as index in listOfCorridors
				for(var i=0,l=corridor.length; i<l; i++){
					var cellRow = corridor[i][0];
					var cellCol = corridor[i][1];
					var val = path.mazeData[cellRow][cellCol];
					path.mazeData[cellRow][cellCol] = (val === -1 ? -1 : 1); //don't replace -1 (route marker) with 1, just leave it
				}
			}
			var c1 = performance.now();
			report.corridors += (c1-c0)
		}
		
		//blocking dead ends here would make the program take forever, so... no.
		
		//check where to make next move, pass on data
		figureOutPossible(n,nc,path);
	}
	
	var d0 = performance.now();
	//execute functions
	blockDeadEnds(maze);
	blockLargerDeadEnds(maze);
	var d1 = performance.now();
	report.deadEnds = (d1-d0)
	identifyCorridors();
	
	//identify corridors of start cell
	var gCellCorridors = mazeC[gCellR][gCellC];
	
	//determine shortest distance, will be checked in makeAStep()
	var minDistance = determineShortestDistance(maze, [gCellR,gCellC], [rCellR,rCellC])
	var p1 = performance.now();
	report.preliminary = (p1-t0);
	
	//start exploration for best path!
	figureOutPossible([gCellR,gCellC], gCellCorridors, new Path(0,maze));
	
	var t1 = performance.now();
	report.adventure = (t1-p1);
	report.totalTime = t1 - t0;
	return PATHS;
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