var board = [[0],
			[1,1],
			[1,1,1],
			[1,1,1,1],
			[1,1,1,1,1]];

var bestSolutionPath;
var bestSolutionPegsLeft = 15; //15 is larger than any solution; will test to see if found solutions are smaller than this

origSpaceList = [[0,0]];
var dirGrid = [[0,1],[-1,0],[-1,-1],[0,-1],[1,0],[1,1]]; //Encodes directions


function getPeg(board,inputCoords,dir,dist) {
	var newCoords = [inputCoords[0]+(dist*dirGrid[dir][0]), inputCoords[1]+(dist*dirGrid[dir][1])];
	if(board[newCoords[0]]===undefined || board[newCoords[0]][newCoords[1]]===undefined) {
		return undefined;
	} else {return board[newCoords[0]][newCoords[1]]}
}

function jump(board,path,spaceList,listIndex,dir){
	var coords = spaceList[listIndex]; //shorthand
	var board = deepCopy(board);
	var spaceList = deepCopy(spaceList);
	
		//remove the two pegs
	var r=coords[0]+dirGrid[dir][0];
	var c=coords[1]+dirGrid[dir][1];
	board[r][c] = 0;
	spaceList.push([r,c]);
	
	r=coords[0]+(2*dirGrid[dir][0]);
	c=coords[1]+(2*dirGrid[dir][1]);
	board[r][c] = 0;
	spaceList.push([r,c]);
	
		//fill space w/ peg
	board[coords[0]][coords[1]] = 1;
	spaceList.splice(listIndex,1);
	
		//document move
	path += ""+r+""+c+" to "+coords[0]+""+coords[1]+"\n";
	
		//call next round
	findSpots(board,path,spaceList);
}

function findSpots(board,path,spaceList){ //aka find peg depending on nofSpaces
	var nSpaces = spaceList.length;
	var validJumpsFound = false; //will make true if found one;
	for(var i=0; i<nSpaces; i++){
		//find valid directions
		for(var d=0; d<6; d++){
			if(getPeg(board,spaceList[i],d,1)===1 && getPeg(board,spaceList[i],d,2)===1) { //check if direction is valid
				//jump in that direction
				validJumpsFound = true;
				jump(board,path,spaceList,i,d);
			}
		}
	}
	
	if(!validJumpsFound){ //if reached dead end
		var pegsLeft = 15-nSpaces;
		
		//log solution to distribution array
		distribution[pegsLeft]++;
		
		if(pegsLeft < bestSolutionPegsLeft){ //if solution is better than any found yet
			bestSolutionPegsLeft = pegsLeft;
			bestSolution = path;
			console.log("New Best: "+pegsLeft+"\n"+path);
			
			//stop program if best is 1 peg left by throwing an error
			if(pegsLeft === 1){
				var error = new Error("We're Done!");
				throw error;
			}
			return;
		}
	}
}

//solve:
findSpots(board,"",origSpaceList);