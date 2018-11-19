//given a vertex, find the angles (0-2pi) where we can draw new edges without interfering with the ones already drawn.
//this function is called by updateCanvas() when drawing loops; it will either pass all the edges from vertexEdgeAngles (globals.js), or only the loops


function getEmptyAngles(v,include,anglesArray){ //include can be "allEdges" or just "loops" or "straightEdges", refers to which edges to use in the calculation
	//anglesArray: you can specify an array for the angle ranges instead of the function using v and include to determine it
	
	let emptyAngles = []; //stores output, in the form of angle ranges: [start_theta, end_theta]
	
	//define 'angles' - an array of angle ranges - by consolidating loop edge angles and straight edge angles as necessary
	//note: 2nd entry in each angle range is further counterclockwise
	let angles;
	if(anglesArray){
		angles = anglesArray;
	} else {
		if(include === "loops"){angles = vertexEdgeAngles[v].loops}
		if(include === "straightEdges"){angles = vertexEdgeAngles[v].straightEdges}
		if(include === "allEdges"){angles = vertexEdgeAngles[v].loops.concat(vertexEdgeAngles[v].straightEdges)}
	}
	
	angles = deepCopy(angles);
	
	//check if there are any limitations (angle ranges) on where we can draw an edge
	if(angles.length === 0){
		emptyAngles = [[0,2*Math.PI]];
		return emptyAngles;
	}
	
	//convert all angles to 0-2pi to allow easier mod operating
	//and offset such that the lowest edge angle range starts at 0
	
	let minAngle = Infinity; //used to figure out offset
	for(let angRange=0; angRange<angles.length; angRange++){
		//convert angles to 0-2pi
		angles[angRange][0] = (angles[angRange][0]+2*Math.PI) % (2*Math.PI);
		angles[angRange][1] = (angles[angRange][1]+2*Math.PI) % (2*Math.PI);
		
		//keep track of minimum starting angle
		if(angles[angRange][0] < minAngle){
			minAngle = angles[angRange][0];
		}
	}
	
	//sort all angles by their starting angle
	angles.sort(function(a,b){return a[0] - b[0]});
	
	//consolidate overlapping angles if there is more than 1 angle-range
	for(let angRange=0; angRange<angles.length && angles.length>1; ){ //angRange gets iterated in the loop, based on some conditions
		//get data of the 2 angle ranges in simpler variable names
		let nextIndex = (angRange+1) % angles.length; //index of next angle range
		let a1 = angles[angRange].slice();
		let a2 = angles[nextIndex].slice();
		//for this to work, all angles need to be larger or equal to the starting angle of a1, even if that means going above 2pi
		if(a1[1] < a1[0]){a1[1] += 2*Math.PI}
		if(a2[0] < a1[0]){a2[0] += 2*Math.PI}
		if(a2[1] < a1[0]){a2[1] += 2*Math.PI}
		
		//check if the end of this angle range is after/equal to the start of the next angle range
		if(a1[1] >= a2[0]){
			if(a1[1] >= a2[1] && a2[0] <= a2[1]){ //if the next range is completely encapsulated in this range
				//delete the next range
				angles.splice(nextIndex, 1);
				if(nextIndex < angRange){angRange--} //examine this angle range again to determine if there's another overlapping angle range
			}
			else if(a1[1] >= a2[1] && a2[1] <= a2[0]){ //if all 2pi radians are occupied by angle ranges
				return emptyAngles; //nothing has been added
			}
			else if(a1[1] < a2[1]){ //the end of this range is in the middle of the next range
				angles[angRange][1] = angles[nextIndex][1]; //enlarge this range to enclose next range
				//delete the next range
				angles.splice(nextIndex, 1);
				if(nextIndex < angRange){angRange--} //examine this angle range again to determine if there's another overlapping angle range
			}
			else {
				//this should never happen, but just in case...
				console.log("Error: Angle consolidation algorithm exploded.");
			}
		}
		else { //this angle range ends before the next angle range starts - go to the next angle range
			angRange++;
		}
		
	}
	
	//go through angles and get empty areas -> add to emptyAngles
	for(let angRange=0; angRange<angles.length; angRange++){
		let nextIndex = (angRange+1) % (angles.length);
		emptyAngles.push([angles[angRange][1], angles[nextIndex][0]]);
	}
	
	return emptyAngles;
}





function visualize(v){
	//visualize vertexEdgeAngles ---------------------------------------
	
	ctx.strokeStyle = "red";
	
	//get html reference
	let vertex = vertices[v];
	
	//get coords of v
	let x = Number(vertex.style.left.split("px")[0]) + 8;
	let y = Number(vertex.style.top.split("px")[0]) + 8;
	
	//loop through entries for vertexEdgeAngles
	for(prop in vertexEdgeAngles[v]){
		for(let a=0; a<vertexEdgeAngles[v][prop].length; a++){
			let ang1 = vertexEdgeAngles[v][prop][a][0];
			let ang2 = vertexEdgeAngles[v][prop][a][1];
			
			let dx = 100*Math.cos(ang1);
			let dy = 100*Math.sin(ang1);
			
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(x+dx,y+dy);
			ctx.stroke();
			
			dx = 100*Math.cos(ang2);
			dy = 100*Math.sin(ang2);
			
			ctx.beginPath();
			ctx.moveTo(x,y);
			ctx.lineTo(x+dx,y+dy);
			ctx.stroke();
		}
	}
	
	ctx.strokeStyle = "black";
	
	//visualize empty angles ------------------------------------------
	ctx.fillStyle = "rgba(0,255,0,0.25)";
	
	//get empty angles
	emptyAngles = getEmptyAngles(v,"allEdges");
	
	//loop through emptyAngles and draw them
	for(i=0; i<emptyAngles.length; i++){
		let ang1 = emptyAngles[i][0];
		let ang2 = emptyAngles[i][1];
		
		ctx.beginPath();
		ctx.arc(x,y,80,ang1,ang2);
		ctx.lineTo(x,y);
		ctx.fill();
	}
	
	ctx.fillStyle = "black";
}