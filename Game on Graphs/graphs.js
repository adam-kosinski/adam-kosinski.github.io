//no more annoying references created
function copyMatrix(original) {
  var copy = [];
  //iterate over rows
  for (var r = 0; r < original.length; r++) {
    //erase or create a new row
    copy[r] = [];
    //iterate over columns
    for (var c = 0; c < original.length; c++) {
    copy[r][c] = original[r][c];
    }
  }
  return copy;
}

//returns base ^ index, base must be a square matrix
function matrixPower(base, index) {
  //product = base x multiplicand
  var product = [];
  var multiplicand = [];
  
  //copy base matrix into product:
  product = copyMatrix(base);
  
  for (var counter = 0; counter < index - 1; counter++) {
    //copy product into multiplicand
    multiplicand = copyMatrix(product);
    
    //multiply:
    //iterate over rows
    for (var r = 0; r < base.length; r++) {
      //iterate over columns
      for (var c = 0; c < base.length; c++) {
        //find each individual entry by multiplying multiplicand by base
        product[r][c] = 0; //clear the product so it can take on new values
        for (var t = 0; t < base.length; t++) {
          product[r][c] += (multiplicand[r][t] * base[t][c]);
        }
      }
    }
  }
  
  return product;
}


//see if a player has won
function checkForWin(M_adj, M_saved, player) { //M_adj = adjacency matrix; M_saved = adjacency matrix, but only including saved edges, player = "S" or "C"
  player = player.toUpperCase();   //in case I'm a derp
  //If a walk exists from A to B, one exists of either length V-1 or V
  var M_toLookAt = player === "S" ? M_saved : M_adj;
  
  //if a path exists in M_toLookAt
  var pathExists = true;
  
  //assume vertex A is [0] and vertex B is [1]
  if (matrixPower(M_toLookAt, M_toLookAt.length)[0][1] + 
    matrixPower(M_toLookAt, M_toLookAt.length - 1)[0][1] === 0) {
    pathExists = false;
  }
  
  //if there's a path in M_saved or no path in M_adj
  return (player === "S" && pathExists) ||
       (player === "C" && !pathExists);
}



//a function that deletes all these useless loops and leaves
function removeUselessEdges(M_adj) {
  var M_adjOutput = copyMatrix(M_adj);

  //Remove loops 
  for (var r = 0; r < M_adjOutput.length; r++) {
    M_adjOutput[r][r] = 0; // no more loop
  }
  

  //Remove leaves
  var leaves = true;  //we think there are leaves
  while (leaves) {   //while there are still leaves
    leaves = false;   //no leaves found yet
    for (var r = 2; r < M_adjOutput.length; r++) {  //don't delete useful edges like a troll
      var adjacentVertices = [];  //which vertices are adjacent to vertex r
      for (var c = 0; c < M_adjOutput[0].length; c++) {
        //push adjacentVertices if the vertices are adjacent
        if (M_adjOutput[r][c] !== 0) {
          adjacentVertices.push(c);
        }
      }
      if (adjacentVertices.length === 1) {  //if there's only 1 adjacent edge
        leaves = true //there are still leaves
        M_adjOutput[r][adjacentVertices[0]] = 0; //no more edge
        M_adjOutput[adjacentVertices[0]][r] = 0; //no more edge
      }
    }
  }
  return M_adjOutput;
}




//pretty self evident actually
function canPlayerForceWin(M_adj, player, M_saved) {
  //M_adj is the adjacency matrix representing the starting graph, player = "S" or "C"; M_saved is adj matrix of only saved edges, optional
  
  player = player.toUpperCase(); //in case we accidentally input a lower case
  
  //if M_saved not passed, generate an adjacency matrix of only saved edges, will need this later - no saved edges right now
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
  }
  
  //return true if already won, false if already lost (by the way, only player C could've won or lost already)
  if (checkForWin(M_adj, M_saved, player)) {return true}
  if (checkForWin(M_adj, M_saved, (player==="S"? "C" : "S"))) {return false}
  
  
  //call makeMove() to determine whether it's possible to guarantee a win from the starting position
  return makeMove(M_adj, M_saved, player);
}




//define recursive function - this will return true if the player can force a win from the given position, and false if not
function makeMove(M_adj, M_saved, player,smv=[],cmv=[]){ //M_adj is the adjacency matrix, M_saved is the adj matrix, but only with saved edges, player = "S" or "C"
  
  //create new matrix objects with the same data, so we don't reference the objects passed as arguments
  M_adj = copyMatrix(M_adj);
  M_saved = copyMatrix(M_saved);
  
  //console.log("function received",M_adj,M_saved)
  
  //check if the other player won, if so, this player can't guarantee a win, return false
  if(checkForWin(M_adj, M_saved, (player==="S"? "C" : "S"))) {return false}
  
  //iterate through all possible moves for this player
  //look for unused edges
  for(var r=0; r<M_adj.length; r++){ //iterate through rows
    for(var c=r; c<M_adj[0].length; c++){ //iterate through columns, going from the main diagonal right to avoid duplicates
      //test if can move here
      if((M_adj[r][c] > 0) && (M_saved[r][c] < M_adj[r][c])) { //if there are edges, and not all the edges are in M_saved
        //try moving on this edge
          //copy matrices so we don't screw up references
        var M_adj_test = copyMatrix(M_adj);
        var M_saved_test = copyMatrix(M_saved);
        var smv_test = copyMatrix(smv)
        var cmv_test = copyMatrix(cmv)
        //console.log("M_saved test after copy",M_saved_test)
        if(player === "S"){
          M_saved_test[r][c]++;
          M_saved_test[c][r]++;
          smv_test.push([r,c])
          //console.log("smv_test after move",smv_test)
        }
        if(player === "C"){
          M_adj_test[r][c]--;
          M_adj_test[c][r]--;
          cmv_test.push([r,c]);
          M_adj_test = removeUselessEdges(M_adj_test);
        }
        //console.log("S Move",r,c,M_adj_test,M_saved_test)
        //check to see if that move won, if so, there was a way to guarantee a win from this position, return true
        if(checkForWin(M_adj_test, M_saved_test, player)){return true}
        
        //else: (no statement needed b/c of return statement)
        //assume that this player can guarantee a win, just not on this move, no matter what the opponent does
        var canWinAllBranchingPositions = true;
        //assume this is true until find an opponent move for which there is no sequence of moves that can guarantee a win for this player
        //if find such an opponent move, return false
        
        //iterate through all possible moves for the opponent
        for(var rr=0; rr<M_adj.length; rr++){ //iterate through rows 'rr' to avoid naming conflict with the other for loop
          //console.log("rr",rr);
          for(cc=0; cc<M_adj[0].length; cc++){ //iterate through cols 'cc' to avoid naming conflict with the other for loop
            //console.log("rr",rr,"cc",cc)
            //console.log(M_adj_test[rr][cc] , M_saved_test[rr][cc])
            
            //test if can move here
            if((M_adj_test[rr][cc] > 0) && (M_saved_test[rr][cc] < M_adj_test[rr][cc])) { //if there are edges, and not all the edges are in M_saved_test
              //make a move for the opponent here
                //copy matrices so we don't screw up references
              var M_adj_2ndTest = copyMatrix(M_adj_test); //'2ndTest' to avoid naming conflict
              var M_saved_2ndTest = copyMatrix(M_saved_test); //'2ndTest' to avoid naming conflict
              var smv_2ndTest = copyMatrix(smv_test)
              var cmv_2ndTest = copyMatrix(cmv_test)
            
              if(player === "S"){ //then it's player C's turn now
                M_adj_2ndTest[rr][cc]--;
                M_adj_2ndTest[cc][rr]--;
                smv_2ndTest.push([rr,cc])
                M_adj_2ndTest = removeUselessEdges(M_adj_2ndTest);
              }
              if(player === "C"){ //then it's player S's turn now
                M_saved_2ndTest[rr][cc]++;
                M_saved_2ndTest[cc][rr]++;
                cmv_2ndTest.push([rr,cc]);
              }
              //console.log("smv_2ndTest",smv_2ndTest,"cmv_2ndTest",cmv_2ndTest)
              //console.log("C move",rr,cc,M_adj_2ndTest,M_saved_2ndTest)
              
              //see if the player can't guarantee a win in this position
              if(!makeMove(M_adj_2ndTest, M_saved_2ndTest, player,smv_2ndTest,cmv_2ndTest)){
                canWinAllBranchingPositions = false;
              }
            }
          }
        }
        
        //if for all opponent moves given this certain player move, the position is a guaranteed win for the player, player can guarantee win
        if(canWinAllBranchingPositions){return true}
        
      } //end check if player could make a move in the row col location
    } //close player move col iteration
  } //close player move row iteration
  
  //if looked through all of first player moves, and there isn't one that will guarantee a win no matter what the opponent does, can't guarantee win; return false
  return false;
} //close recursive function definition
