function deleteVertex(e){ //eventHandling.js passes the mouse click event
	let index = vertices.indexOf(e.target);
	
	//remove vertex+incident edges from M_adj
	M_adj.splice(index,1);
	for(let r=0; r<M_adj.length; r++){
		M_adj[r].splice(index,1);
	}
	
	//remove vertex from vertices and vertexEdgeAngles
	vertices.splice(index,1);
	vertexEdgeAngles.splice(index,1); //see globals.js for more info
	
	//remove vertex label from html
	document.body.removeChild(document.getElementById("label-"+index));
	
	//remove vertex from html
	document.body.removeChild(e.target);
	
	//remove incident edges from html (already removed from M_adj)
		//clear all of the edge hit canvases - updateCanvas() will regenerate these for edges present in M_adj
	hitCanvases.innerHTML = "";
	updateCanvas("updateVertexEdgeAngles");
	
	updateAdjacencyMatrixDisplay();
	
	//relabel all the vertices of a higher index than this one (remember this vertex has already been spliced out of the vertices array)
	for(let v=index; v<vertices.length; v++){
		let vertex = vertices[v];
		let label = document.getElementById("label-"+vertex.id.split("-")[1]);
		
		//if vertex still labeled by index (user hasn't changed the label name), then update that in the display
		if(label.textContent === String(v+1)){
			label.textContent = v;
		}
	
		vertex.id = "vertex-"+v;
		label.id = "label-"+v;
	}
}


function deleteEdge(){
	//the edge to delete will be stored in shadowedEdge as [v1,v2,n]
	let v1 = shadowedEdge[0];
	let v2 = shadowedEdge[1];
	
	//remove edge from M_adj
	M_adj[v1][v2]--;
	if(v1 !== v2){
		M_adj[v2][v1]--;
	}
	
	shadowedEdge = undefined; //so we don't accidentally delete an edge that was already deleted
	
	//remove edge from HTML
		//clear all the edge hit canvases - updateCanvas() will regenerate these for edges present in M_adj
	updateCanvas("updateVertexEdgeAngles");
	
	updateAdjacencyMatrixDisplay();
}