function addVertex(e){ //eventHandling.js passed the click event to this function
	
	//html stuff
	
	let newVertex = document.createElement("div");
	newVertex.id = "vertex-"+vertices.length;
	newVertex.className = "vertex";
	newVertex.style.top = (e.pageY - 8) + "px"; //the vertices are 16px tall and wide, so -8 is for centering vertex on click location
	newVertex.style.left = (e.pageX - 8) + "px"; //same reason as above
	document.body.appendChild(newVertex); //add vertex to the body
	
	let newLabel = document.createElement("div"); //it's a div so I can set the width to properly center the label on the vertex
	newLabel.id = "label-"+vertices.length;
	newLabel.className = "vertexLabel";
	newLabel.textContent = vertices.length;
	newLabel.style.width = "16px";
	if(showLabels){newLabel.style.display = "block"} //override default of not showing them
	newLabel.style.top = (e.pageY - 32) + "px"; //labels are positioned above vertices
	newLabel.style.left = (e.pageX - 8) + "px"; //labels are centered horizontally w/ vertices
	document.body.appendChild(newLabel);
	
	//data stuff
	
	vertices.push(newVertex); //store html reference at the same index that the vertex will be at in M_adj
	vertexEdgeAngles.push({loops:[], straightEdges:[]}); //see globals.js for more info
	
		//modify adjacency matrix
	let nVertices = M_adj.length;
	let newRow = [0]; //define new row, start filling it
	for(let v=0; v<nVertices; v++){ //iterate through vertices
		M_adj[v].push(0); //add new col
		newRow.push(0); //finish filling new row
	}
	M_adj.push(newRow); //add new row
	
	console.log("M_adj",M_adj);
	
	updateAdjacencyMatrixDisplay();
}



function addEdge(v1, v2){ //v1 and v2 are the indices of the two vertices the new edge will be incident to
	console.log("add edge",v1,v2);
	
	M_adj[v1][v2]++;
	if(v1 !== v2){M_adj[v2][v1]++}
	
	updateCanvas("updateVertexEdgeAngles"); //function in updateCanvas.js, since we're adding a new edge, update vertexEdgeAngles (global var)
	updateCanvas(); //use the updated vertexEdgeAngles to redraw loops properly
	
	updateAdjacencyMatrixDisplay();
}