//no more annoying references created
function copyMatrix(original) {
  var copy = [];
  var nVertices = original.length;
  
  //iterate over rows
  for (var r = 0; r < nVertices; r++) {
    //erase or create a new row
    copy[r] = [];
    //iterate over columns
    for (var c = 0; c < nVertices; c++) {
    copy[r][c] = original[r][c];
    }
  }
  return copy;
}



function contract(M_adj, v1, v2){ //v1 & v2 are vertex indices; the edge to contract goes from v1 to v2
	//function returns the adjacency matrix after the contraction is made
	
	//check if I'm being stupid
	if(M_adj[v1][v2] === 0){
		console.warn("M_adj",copyMatrix(M_adj));
		console.warn("v1, v2",v1,v2);
		throw new Error("There's no edge to contract");
	}
	
	//v1 should be less than or equal to v2 to preserve the special indices of vertex A [0] and B [1]
	if(v1 > v2){
		let indices = [v1,v2];
		v1 = indices[1];
		v2 = indices[0];
	}
	
	M_adj = copyMatrix(M_adj);
	
	//3 steps to contraction:
	
	//1. delete edges incident to v1 and v2
	M_adj[v1][v2] = 0;
	M_adj[v2][v1] = 0;
	
	//2. add v2 edges to v1 edges
	for(var i=0; i<M_adj.length; i++){
		M_adj[v1][i] += M_adj[v2][i];
		M_adj[i][v1] += M_adj[i][v2];
	}
	
	//3. delete v2
	M_adj.splice(v2,1);
	for(var i=0; i<M_adj.length; i++){
		M_adj[i].splice(v2,1);
	}
	
	return M_adj;
}

//function for contracting along multiple edges simultaneously; will call contract() multiple times after doing some manipulation
function contractMultipleEdges(M_adj, edgesToContract){ //edgesToContract is an array of 2-element arrays containing the args v1 and v2 to pass to contract
	//2 return values: if contracting will cause player S to win, returns "S wins"
	//else, returns the resulting adjacency matrix
	
	M_adj = copyMatrix(M_adj);
	while(edgesToContract.length > 0){ //each time we contract, will remove the corresponding item from edgesToContract, until none are left
		//grab the first entry in edgesToContract
		let v1 = edgesToContract[0][0];
		let v2 = edgesToContract[0][1];
		
		//test if we're about to contract vertices A and B
		if(Math.min(v1,v2)===0 && Math.max(v1,v2)===1){
			return "S wins";
		}
		
		//contract and remove the corresponding entry in edgesToContract
		M_adj = contract(M_adj, v1, v2);
		edgesToContract.splice(0,1);
		
		//correct indices
		//when contracting, the vertex w/ the larger index gets deleted
		//1. Any references to this deleted vertex need to be changed to point at the vertex w/ the smaller index
		//2. Any references to a vertex with a larger index need to have that index adjusted by subtracting one
		
		let v_deleted = Math.max(v1, v2);
		let v_kept = Math.min(v1, v2);
		for(let e=0; e<edgesToContract.length; e++){ //iterate through edgesToContract
			for(let v=0; v<2; v++){ //iterate through the 2 vertices in each entry
				//deal with #1
				if(edgesToContract[e][v] === v_deleted){
					edgesToContract[e][v] = v_kept;
				}
				//deal with #2
				else if(edgesToContract[e][v] > v_deleted){
					edgesToContract[e][v]--;
				}
			}
		}
	}
	
	return M_adj;
}


//function to simplify M_adj without changing the winner
function simplify(M_adj,preserve_m=false){ //if preserve_m is true, don't do operations that might change m
	//2 possible return values: "S wins" if we contracted A and B at somepoint, else the resulting adjacency matrix
	
	M_adj = copyMatrix(M_adj);
	
	//remove loops
	for(var v=0; v<M_adj.length; v++){
		M_adj[v][v] = 0;
	}
	
	//do functions that may need to be run through M_adj multiple times, b/c changing something creates an opportunity for changing something else
	var somethingChanged = true; //did we change something last time around? If so, there might be more we can do this time
	while(somethingChanged) {
		somethingChanged = false; //nothing changed yet
		
		
		/*/automatically contracting multiedges won't change the winner, but will change m
		if(!preserve_m){
			for(var v1=0; v1<M_adj.length; v1++){ //note: M_adj.length will change inside this loop
				for(var v2 = v1+1; v2<M_adj.length; v2++){
					//test for multiedge
					if(M_adj[v1][v2] >= 2){
						if(v1===0 && v2===1){return "S wins"} //v2 will always be larger than v1 b/c of how we're iterating
						
						M_adj = contract(M_adj, v1, v2);
						
						somethingChanged = true;
					}
				}
			}
		}*/
		
		//deleting vertices of degree 0, 1, or 2 (that aren't A or B) won't change the winner; deg 2 will change m though
		for(var v=2; v<M_adj.length; v++){ //start at index 2 so we don't grab A or B, recalculate M_adj.length each time b/c it changes within the loop
			let deg = M_adj[v].reduce(function(a,b){return a+b});
			
			if((preserve_m && deg <= 1) || (!preserve_m && deg <= 2)){ //then delete the vertex
				M_adj.splice(v,1);
				for(var j=0; j<M_adj.length; j++){
					M_adj[j].splice(v,1);
				}
				
				somethingChanged = true;
			}
		}
		
	}
	
	return M_adj;
}

//function to check if there's a path from vertex A to B, used for testing if player C won
function pathExists(M_adj){
	
	//assume vertex A is [0] and vertex B is [1]
	//use gas method by marking all vertices adjacent to A, then all vertices adjacent to those vertices, etc. - See if ever reach Boolean
	var somethingChanged = true; //stop marking when nothing changed in last iteration of marking - means all vertices w/ a path to A were marked
	var marker = -2; //decrements each iteration, vertex A is manually marked -1, so start by marking -2 and decrementing each time
	var vertices = M_adj[0].slice(); //create an array of correct length w/o for loop; it doesn't matter what the values are (which will be positive), since the markers are negative integers
	vertices[0] = -1; //mark vertex A
	//do marking iteration
	while(somethingChanged){
		somethingChanged = false; //assume nothing changes until we mark a vertex
		
		//iterate through vertices ("rows")
		nVertices = M_adj.length;
		for(var v=0; v<nVertices; v++){
			if(vertices[v] === marker+1){ //this vertex was marked last round
				//iterate through adjacent vertices
				for(var c=0; c<nVertices; c++){
					//check if there's an edge between the 2 vertices (v and c), and c hasn't been marked yet
					if(M_adj[v][c] > 0 && vertices[c] >= 0){
						//mark it
						vertices[c] = marker;
						somethingChanged = true;
					}	
				}
			}
		}
		marker--;
	}
  
	//check if vertex B was marked - means there's a path
	if(vertices[1] < 0){
		return true;
	}
}