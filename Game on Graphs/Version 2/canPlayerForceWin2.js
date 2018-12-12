//differs from canPlayerForceWin.js in that only one move is made for each makeMove() call; and the player passed to makeMove() is toggled

//pretty self evident actually
function canPlayerForceWin(M_adj, player) {
  //M_adj is the adjacency matrix representing the starting graph, player = "S" or "C"
  
  player = player.toUpperCase(); //in case we accidentally input a lower case
  
  /*/simplify graph without changing who wins
  result = simplify(M_adj); //this might change m, by the way
  if(result === "S wins"){return player==="S"? true : false}
  */
  //check if player C won already (player S will be taken care of the best I can do by simplify() above)
  if(!pathExists(M_adj) && player==="C"){return true}
  
  
  //call makeMove() - defined below - to determine whether it's possible to guarantee a win from the starting position
  return makeMove(M_adj, player);
}




//define recursive function - this will return true if the player can force a win from the given position, and false if not
function makeMove(M_adj, player){ //M_adj is the adjacency matrix, player = "S" or "C"
  
  //create new matrix object with the same data, so we don't reference the object passed as arguments
  M_adj = copyMatrix(M_adj);
  
  //console.log("function received",M_adj)
  
  //iterate through all possible moves for this player
  //look for unused edges
  for(var r=0; r<M_adj.length; r++){ //iterate through rows
    for(var c=r+1; c<M_adj[0].length; c++){ //iterate through columns, going from 1-to-the-right-of-the-main-diagonal (loops don't matter) right to avoid duplicates
      //test if can move here
      if(M_adj[r][c] > 0) { //if there are edges (non-contracted is implied, otherwise they wouldn't be there)
        //try moving on this edge
		let M_adj_modified = copyMatrix(M_adj);
		
        if(player === "S"){
		  if(r===0 && c===1){return true} //because we contracted between A and B, and this player is player S
		  M_adj_modified = contract(M_adj_modified, r, c); //make the move
        }
        if(player === "C"){
		  M_adj_modified[r][c]--;
          M_adj_modified[c][r]--;
        }
        
		/*/simplify the graph and see if either player won
		let result = simplify(M_adj_modified);
		
		if(result === "S wins"){
			if(player === "S"){return true}
			else {continue} //if this player is player C but player S won, try making a different move
		}
		else {M_adj_modified = result}
		*/
		
		if(player==="C" && !pathExists(M_adj_modified)){return true}
		
        //if that move didn't win for a player:
		//this player can force a win after this move if the other player can't force a win
		let otherPlayer = player==="S"? "C" : "S";
		if(!makeMove(M_adj_modified, otherPlayer)){
			//the other player couldn't force a win --> this player can force one no matter what they do
			return true;
		} else {
			continue; //this player couldn't force a win with that move; try making a different move
		}
		
      } //end check if player could make a move in the row col location
    } //close player move col iteration
  } //close player move row iteration
  
  //if looked through all of first player moves, and there isn't one that will guarantee a win no matter what the opponent does, can't guarantee win; return false
  return false;
} //close recursive function definition
