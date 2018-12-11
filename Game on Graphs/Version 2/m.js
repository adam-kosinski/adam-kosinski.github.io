//function that gets all combinations of size r of integers from 0 to n-1 (n integers), returns an array of arrays-containing-combinations, can only have 1 of each number
function combine(n,r,combinations=[],combo=[]){ //last 2 args are for recursion; combo is the current combination being assembled, combinations is the storage of all combos
  //*Note: the =[] is 'default notation'; if arg isn't passed, define it as []
  if(combo.length === r){
    combinations.push(combo);
    return; //don't keep adding to the combination
  }
  
  //every time, only choose a number equal to or larger than the last number chosen
  var lastNum;
  if(combo.length === 0) {lastNum = -1} //start adding numbers at 0
  else {lastNum = combo[combo.length - 1]}
  
  for(var i = lastNum+1; i<=n-(r-combo.length) && i<n; i++){ //(r-combo.length) is how many numbers need to be chosen to complete the combo; need i<n b/c the 1st check doesn't end the loop
    var comboCopy = combo.slice(); //create a new array so references don't get weird
    comboCopy.push(i); //add this number
    combine(n,r,combinations,comboCopy); //call recursively to finish all combinations
  }
}






//function that determines "m" given an adjacency matrix of a graph
function get_m(M_adj){ //M_adj is adjacency matrix
  M_adj = simplify(M_adj, true);
  console.log("M_adj",M_adj);
  //get array of edges; each element in the array is of form [r,c] to denote where the edge is found in the adjacency matrix
  //this array is useful when trying to pick combinations of edges
  var edges = [];
  for(var r=0; r<M_adj.length; r++){ //iterate through rows
    for(var c=r; c<M_adj[0].length; c++){ //iterate through columns, starting at the main diagonal and moving right
      //test to see if there is an edge
      var numEdges = M_adj[r][c];
      if(numEdges > 0){
        //push each edge that there is
        for(var e=0; e<numEdges; e++){
          edges.push([r,c]);
        }
      }
    }
  }
  
  //start by guessing m is zero
  var m = 0;
  
  //determine who can win
  var S_win = canPlayerForceWin(M_adj, "S"); //stores whether or not player S can force a win if they move first
  var C_win = canPlayerForceWin(M_adj, "C"); //stores whether or not player C can force a win if they move first
  
  //if first player win, m=0
  if(S_win && C_win){return 0}
  
  //if S win, m>0
  else if(S_win && !C_win){
    //if there is an edge between vertices A and B, Player C must cut it; we can find m for that graph then add one
    if(M_adj[0][1] > 0){
      M_adj_modified = copyMatrix(M_adj);
      M_adj_modified[0][1]--; //this won't produce a graph where A and B are disconnected, because then S would also be able to win, and the else if wouldn't be triggered
      M_adj_modified[1][0]--;
      return get_m(M_adj_modified) + 1;
    }
    
    //keep incrementing m until with m moves C is able to guarantee a victory, then actual m = that m - 1
    for(m = 1; m <= M_adj.length; m++){
      console.log("m",m)
      //choose m edges to cut
      //get combinations of m edges
      var combinations = [];
      combine(edges.length, m, combinations);
      
      //iterate through combinations
      comboIteration:
      for(var i=0; i<combinations.length; i++){
        //copy M_adj so no weird reference stuff
        var M_adj_test = copyMatrix(M_adj);
        
        //iterate through edges in this combination
        for(var e=0; e<m; e++){
          var r = edges[combinations[i][e]][0];
          var c = edges[combinations[i][e]][1];
          
          //cut edge
          M_adj_test[r][c]--;
          M_adj_test[c][r]--;
        }
		
		//it will be player S's turn now, test if they can force win. By one of our theorems, if they can't force win, C can force win.
        //if so, then the actual m = this m - 1
        if(!canPlayerForceWin(M_adj_test, "S")) {return m - 1}
      }
    }
    return Infinity; //"S" won in starting position
  }
  
  //if C win, m<0 - logic very similar to above 'if S win'
  else if(!S_win && C_win){
    
    //keep decrementing m until with |m| moves S is able to guarantee a victory, then actual m = that m + 1
    for(m = -1; m >= -M_adj.length; m--){
      //choose |m| edges to save
      //get combinations of |m| edges
      var combinations = [];
      combine(edges.length, Math.abs(m), combinations);
      
      //iterate through combinations
      comboIteration:
      for(var i=0; i<combinations.length; i++){
        //copy M_adj so no weird reference stuff
        var M_adj_test = copyMatrix(M_adj);
        
		//collect edges in this combination and contract them all at once with contractMultipleEdges()
		let edgesToContract = [];
        //iterate through edges in this combination
        for(var e=0; e<Math.abs(m); e++){
          var r = edges[combinations[i][e]][0];
          var c = edges[combinations[i][e]][1];
		  edgesToContract.push([r,c]);
        }
		//save (contract) all edges
		contractMultipleEdges(M_adj_test, edgesToContract);
		
		//it will be player C's turn now, test if they can force win. By one of our theorems, if they can't force win, S can force win.
        //if so, then the actual m = this m + 1
        if(!canPlayerForceWin(M_adj_test, "C")) {return m + 1}
      }
    }
    return -Infinity; //"C" won in the starting position
  }
}