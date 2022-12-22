//resize canvas when window is resized

window.addEventListener("resize", windowResized);

function windowResized(){
	//loop through main canvas and hitCanvases (for edges), resetting them
	let canvases = document.getElementsByTagName("canvas");
	for(var i=0; i<canvases.length; i++){
		canvases[i].width = window.innerWidth * canvas_width_fraction;
		canvases[i].height = window.innerHeight;
		canvases[i].style.width = window.innerWidth * canvas_width_fraction + "px";
		canvases[i].style.height= window.innerHeight + "px";
	}

	//redraw edges, since the canvas drawing will get deleted when we resize the canvas
	updateCanvas(); //function in updateCanvas.js
}


//detect keypress and switch to appropriate mode
document.addEventListener("keypress", handleKeypress);

function handleKeypress(e){
	switch(e.key){
		case "m":
			if(M_adj_display.style.display === "block"){M_adj_display.style.display = "none"}
			else {
				updateAdjacencyMatrixDisplay();
				M_adj_display.style.display = "block";
			}
			break;
		case "v":
			if(mode === "add vertex"){switchMode("move vertex")} //if already in this mode, go back to default mode
			else {switchMode("add vertex")}
			break;
		case "e":
			if(mode === "add edge"){switchMode("move vertex")}
			else {switchMode("add edge")}
			break;
		case "d":
			if(mode === "delete"){switchMode("move vertex")}
			else {switchMode("delete")}
			break;
		case "l":
			if(mode === "change label"){switchMode("move vertex")}
			else {switchMode("change label")}
			break;
		case "L": //toggle label display
			showLabels = showLabels? false : true;
			let labels = document.getElementsByClassName("vertexLabel");
			for(let i=0; i<labels.length; i++){
				if(showLabels){
					labels[i].style.display = "block";
				}
				else {labels[i].style.display = "none"}
			}
			break;
		default:
			switchMode("move vertex"); //this is the default mode
	}
}

function updateAdjacencyMatrixDisplay(){
	let stringMatrix = JSON.stringify(M_adj);
	stringMatrix = stringMatrix.replace(/\[\[/g, "[\n[");
	stringMatrix = stringMatrix.replace(/\],/g, "],\n");
	stringMatrix = stringMatrix.replace(/\]\]/g, "]\n]");
	M_adj_display.innerText = "Adjacency Matrix:\n"+stringMatrix;
}

function switchMode(targetMode){ //targetMode is a string
	mode = targetMode; //mode is a global variable
	console.log("mode:",mode);

	switch(targetMode){
		case "move vertex":
			mode_display.innerText = "Move Vertex";
			break;
		case "add vertex":
			mode_display.innerText = "Add Vertex";
			break;
		case "add edge":
			mode_display.innerText = "Add Edge: Select 1st Vertex";
			break;
		case "delete":
			mode_display.innerText = "Delete";
			break;
		case "change label":
			mode_display.innerText = "Change Label";
			break;
	}

	verticesForEdge = []; //always reset this temporary storage
}



//detect clicks and direct control to the appropriate function
//a click could add a vertex or select a vertex for a new edge, or delete a vertex or edge

document.addEventListener("click", handleClick);

function handleClick(e){
	switch(mode){
		case "move vertex":
			break;
		case "add vertex":
			if(e.target === canvas){addVertex(e)} //function in addStuff.js; e.target check so we don't have vertices on top of each other
			break;
		case "add edge":
			if(e.target.className === "vertex"){ //check if we clicked on a vertex, b/c clicks indicate which vertices the new edge will be incident to
				if(verticesForEdge.length === 0){
					verticesForEdge.push(vertices.indexOf(e.target)); //push index of the vertex
					mode_display.innerText = "Add Edge: Select 2nd Vertex";
				} else if(verticesForEdge.length === 1){
					verticesForEdge.push(vertices.indexOf(e.target)); //push index of the vertex
					addEdge(verticesForEdge[0], verticesForEdge[1]); //add the edge. function in addStuff.js

					//reset for adding another edge
					mode_display.innerText = "Add Edge: Select 1st Vertex";
					verticesForEdge = [];
				}
			}
			break;
		case "delete":
			if(e.target.className === "vertex"){deleteVertex(e)}
			else if(shadowedEdge){deleteEdge()}
			break;
		case "change label":
			if(e.target.className === "vertexLabel"){
				let newLabel = prompt("Enter custom label for this vertex:",e.target.textContent);
				if(newLabel && newLabel.length > 0){
					e.target.textContent = newLabel;
				}
			}
	}
}


//detect mousedown and mouseup for dragging purposes; drag is also stopped if mouse leaves window (see mousemove)
document.addEventListener("mousedown",handleMousedown);
document.addEventListener("mouseup",handleMouseup);

function handleMousedown(e){

	if(e.target.className === "vertex"){
		//start dragging
		draggedVertex = e.target;
		M_adj_display.style.WebkitUserSelect = "none";
	}
}

function handleMouseup(){
	//stop dragging
	draggedVertex = undefined;
	M_adj_display.style.WebkitUserSelect = "text";
}


//detect mousemove, for dragging and so can create a red shadow around vertices and edges for the delete mode
document.addEventListener("mousemove",handleMousemove);

function handleMousemove(e){
	//do shadows around vertices
	//remove all shadows first
	for(let v=0; v<vertices.length; v++){
		vertices[v].style.boxShadow = "none";
	}
	//add shadow
	if(e.target.className === "vertex"){
		if(mode === "delete"){
			e.target.style.boxShadow = "0 0 20px 3px red";
		} else {
			e.target.style.boxShadow = "0 0 20px 3px yellow";
		}
	}

	//do edge shadows (for the delete mode)
	if(mode === "delete" && e.target === canvas){
		//test if we're over an edge using pixel colors
		let imageData = mainHitCtx.getImageData(0, 0, canvas.width, canvas.height);
		let alpha = imageData.data[e.pageY*(imageData.width*4) + (e.pageX*4) + 3];

		if(alpha > 0){ //there's an edge here; find out which one

			//iterate through hit canvases
			let hitCanvases = document.getElementsByClassName("hitCanvas"); //different variable than the global one
			let maxAlphaCanvas = {canvas_id:undefined, alpha:0} //because hovering in one spot might be over multiple edges, store one canvas w/ max alpha
			for(var i=0; i<hitCanvases.length; i++){
				let hitCtx = hitCanvases[i].getContext("2d");
				let imageData = hitCtx.getImageData(0, 0, hitCanvases[i].width, hitCanvases[i].height);
				let alpha = imageData.data[e.pageY*(imageData.width*4) + (e.pageX*4) + 3];

				if(alpha > maxAlphaCanvas.alpha){ //maxAlphaCanvas.alpha is set at starting of 0 above
					edgeHere = true;
					maxAlphaCanvas = {canvas_id:hitCanvases[i].id, alpha:alpha}
				}
			}
			//store this edge in a global variable that updateCanvas() will read when drawing edges
			if(maxAlphaCanvas.canvas_id){ //check is needed b/c the program might think the red shadow is an edge when it isn't
				let prevShadowedEdge = shadowedEdge;

				shadowedEdge = maxAlphaCanvas.canvas_id.split("-").map(function(a){return Number(a)}); //split the id and change all 3 parts to numbers so that data type is correct

				//display shadow
				if(prevShadowedEdge !== shadowedEdge){ //check b/c of efficiency/lag stuff (this function gets called every mousemove)
					updateCanvas();
				}

				//set mouse style
				canvas.style.cursor = "pointer";
			}
		}
		else { //if no edge here
			if(shadowedEdge){ //if there used to be a red shadowed edge
				shadowedEdge = undefined;
				//remove shadow
				updateCanvas();
			}
			//mouse style
			canvas.style.cursor = "default";
		}

	} else if(shadowedEdge){ //if not delete mode or not on top of canvas, get rid of shadow if it exists
		shadowedEdge = undefined;
		updateCanvas();
	}

	//handle dragging
		//stop the drag if leaving the window
	if(mode === "move vertex" && (e.pageX<0 || e.pageX>window.innerWidth * canvas_width_fraction || e.pageY<0 || e.pageY>window.innerHeight)){
		draggedVertex = undefined;
		M_adj_display.style.WebkitUserSelect = "text";
	}

	if(mode === "move vertex" && draggedVertex){ //if draggedVertex has a value (HTML vertex), then we're dragging
		draggedVertex.style.left = e.pageX - 8 + "px"; //-8 b/c vertices are 16px square
		draggedVertex.style.top = e.pageY - 8 + "px";

		let label_id = "label-"+draggedVertex.id.split("-")[1];
		let label = document.getElementById(label_id);
		label.style.left = e.pageX - 8 + "px";
		label.style.top = e.pageY - 32 + "px";

		updateCanvas("updateVertexEdgeAngles");
	}
}
