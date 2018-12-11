//pretty self evident actually
function canPlayerForceWin(M_adj, player) {
  //M_adj is the adjacency matrix representing the starting graph, player = "S" or "C"; M_saved is adj matrix of only saved edges, optional
  
  player = player.toUpperCase(); //in case we accidentally input a lower case
  
  /*/if M_saved not passed, generate an adjacency matrix of only saved edges, will need this later - no saved edges right now
  if(!M_saved){
    M_saved = [];
    //iterate over rows
    for(var r=0; r<M_adj.length; r++){
      var row = [];
      //iterate over columns
      for(var c=0; c<M_adj[0].length; c++){
        row.push(0);
      }
      M_saved.push(row);
    }
  }*/
  
  //simplify graph without changing who wins
  result = simplify(M_adj); //this might change m, by the way
  if(result === "S wins"){return player==="S"? true : false}
  
  //check if player C won already (player S will be taken care of the best I can do by simplify() above)
  if(!pathExists(M_adj) && player==="C"){return true}
  
  
  //call makeMove() - defined below - to determine whether it's possible to guarantee a win from the starting position
  return makeMove(M_adj, player);
}




//define recursive function - this will return true if the player can force a win from the given position, and false if not
function makeMove(M_adj, player){ //M_adj is the adjacency matrix, M_saved is the adj matrix, but only with saved edges, player = "S" or "C"
  
  //create new matrix object with the same data, so we don't reference the object passed as arguments
  M_adj = copyMatrix(M_adj);
  
  //console.log("function received",M_adj)
  
  //check if the other player won, if so, this player can't guarantee a win, return false
  //if(checkForWin(M_adj, M_saved, (player==="S"? "C" : "S"))) {return false}
  
  //iterate through all possible moves for this player
  //look for unused edges
  for(var r=0; r<M_adj.length; r++){ //iterate through rows
    for(var c=r+1; c<M_adj[0].length; c++){ //iterate through columns, going from 1-to-the-right-of-the-main-diagonal (loops don't matter) right to avoid duplicates
      //test if can move here
      if(M_adj[r][c] > 0) { //if there are edges (non-contracted is implied, otherwise they wouldn't be there)
        //try moving on this edge
        if(player === "S"){
          //no weird reference issues
		  var M_adj_test = copyMatrix(M_adj);
		  
		  if(r===0 && c===1){return true} //because we contracted between A and B, and this player is player S
		  M_adj_test = contract(M_adj_test, r, c); //make the move
        }
        if(player === "C"){
          //no weird reference issues
		  var M_adj_test = copyMatrix(M_adj);
		  
		  M_adj_test[r][c]--;
          M_adj_test[c][r]--;
		  
		  //Will test for if player C won after simplification
        }
        
		//simplify the graph and see if either player won
		let result = simplify(M_adj_test);
		
		if(result === "S wins"){
			if(player === "S"){return true}
			else {continue}
		}
		else {M_adj_test = result}
		
		if(player==="C" && !pathExists(M_adj_test)){return true}
		
		        
        //if that move didn't win for a player:
        //assume that this player can guarantee a win, just not on this move, no matter what the opponent does
        var canWinAllBranchingPositions = true;
        //assume this is true until find an opponent move for which there is no sequence of moves that can guarantee a win for this player
        //if find such an opponent move, return false
        
        //iterate through all possible moves for the opponent
		opponentMoveIteration:
        for(var rr=0; rr<M_adj_test.length; rr++){ //iterate through rows; 'rr' to avoid naming conflict with the other for loop
          for(cc=0; cc<M_adj_test[0].length; cc++){ //iterate through cols; 'cc' to avoid naming conflict with the other for loop
            
            //test if can move here
            if(M_adj_test[rr][cc] > 0) { //if there are edges (non-contracted implied)
              //make a move for the opponent here
            
              if(player === "S"){ //then it's player C's turn now
                //no weird reference problems
				var M_adj_2ndTest = copyMatrix(M_adj_test); //'2ndTest' to avoid naming conflict
				
				M_adj_2ndTest[rr][cc]--;
                M_adj_2ndTest[cc][rr]--;
              }
              if(player === "C"){ //then it's player S's turn now
			    //no weird reference problems
				var M_adj_2ndTest = copyMatrix(M_adj_test); //we don't modify this, so it's OK to just pass reference
                
				if(rr===0 && cc===1){ //player S was able to contract between A and B; cc>=rr
					canWinAllBranchingPositions = false;
					continue;
				}
                M_adj_2ndTest = contract(M_adj_2ndTest, rr, cc);
              }
              
			  //simplify the graph and see if either player won
			  let result = simplify(M_adj_2ndTest);
			  if(result === "S wins"){
				  if(player === "C"){
					  canWinAllBranchingPositions = false;
				  }
				  continue;
			  }
			  else {M_adj_2ndTest = result}
			  
			  if(player==="S" && !pathExists(M_adj_2ndTest)){
				  canWinAllBranchingPositions = false;
				  continue;
			  }
			  
			
              //see if the player can't guarantee a win in this position
              if(!makeMove(M_adj_2ndTest, player)){
                canWinAllBranchingPositions = false;
				//break opponentMoveIteration; -This line SHOULD make the program faster, but it actually slows it down tremendously... why?
              }
            }
          }
        }
        
        //if for all opponent moves given this certain player move, the position is a guaranteed win for the player
        if(canWinAllBranchingPositions){return true}
        
      } //end check if player could make a move in the row col location
    } //close player move col iteration
  } //close player move row iteration
  
  //if looked through all of first player moves, and there isn't one that will guarantee a win no matter what the opponent does, can't guarantee win; return false
  return false;
} //close recursive function definition
