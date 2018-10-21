
var resultArray = []; //to store result objects

function pickAllOptions(board,path){
	/*don't need to slice board & path arrays at beginning b/c that will be done separately in executePick() for each pick*/
	//iterate through choices
	for(var pos=1; pos<=6; pos++){
		if(board[pos] > 0){
			let pathcopy = path.slice(); //need to slice so that path can have different positions added to the end
			pathcopy.push(pos);
			executePick(pos,board,pathcopy);
		}
	}
}


function Result(board,path){ //to create result objects
	this.board = board;
	this.path = path;
}


function executePick(pos,board,path){
	board = board.slice();
	path = path.slice();
	
	var hand = board[pos]; //grab the marbles
	board[pos] = 0;
	
	do{
		pos = (pos - 1 + 13) % 13; //move over one (change position), index goes down one or wraps around if at 0
		
		//if putting LAST marble in this position
		if(hand === 1){
			if(pos===0){ //if landed in home spot
				board[0]++; //increment score/home-position-marbles
				pickAllOptions(board,path);
				return;
			} else if(board[pos] > 0){ //if there are marbles in this position
				hand += board[pos]; //pick up marbles
				board[pos] = 0;
				continue; //move along
			} else if(board[pos] === 0){ //if this position is empty
				board[pos]++; //add the marble in hand to the position
				resultArray.push(new Result(board,path));
				return;
			}
		} else if(hand > 1){
			hand--;
			board[pos]++;
			//will continue along when hit loop end
		}
	} while(true);
}

function determineBestPath(){
	var bestScore = 0;
	var bestIndex;
	
	for(var i=0,l=resultArray.length; i<l; i++){
		if(resultArray[i].board[0] > bestScore){
			bestScore = resultArray[i].board[0];
			bestIndex = i;
		}
	}
	
	return resultArray[bestIndex];
}


//execute code
var board = [0,4,4,4,4,4,4,
				4,4,4,4,4,4];

pickAllOptions(board,[]); //path array doesn't contain any choices to start with - empty array

var bestPath = determineBestPath();

console.log(bestPath)