
//function to loop through all the edges and draw them so that they look nice and don't fall on top of each other
function updateCanvas(updateVertexEdgeAngles){
	
	ctx.clearRect(0,0,canvas.width,canvas.height);
	mainHitCtx.clearRect(0,0,mainHitCanvas.width,mainHitCanvas.height);
	
	//If even number of edges between 2 vertices:
	//no straight edge
	//other edges drawn in pairs on circular arcs on either side of the line reaching a certain maximum offset perpendicular to the line (at the edge's midpoint)
	
	//If odd number of edges between 2 vertices:
	//one straight edge
	//rest of edges same as above, but offset will be a bit different (keep all edges same distance apart at their midpoints)
	
	var edgeSpacing = 20; //in pixels, how far apart the midpoints of the edges will be
	
	let newVertexEdgeAngles = []; //we need to preserve vertexEdgeAngles during drawing for the loop drawing, but will reassign vertexEdgeAngles to this at the function end
	if(updateVertexEdgeAngles){
		for(let v=0; v<vertices.length; v++){
			newVertexEdgeAngles[v] = {loops:[], straightEdges:[]} //clear it, then add in updated values when drawing edges
		}
	}
	
	//draw edges
		//iterate on and to the right of the main diagonal in M_adj
	for(let r=0; r<M_adj.length; r++){
		for(let c=r; c<M_adj.length; c++){
			
			//get number of edges between these 2 vertices
			let nEdges = M_adj[r][c];
			
			//draw edges between these 2 vertices
			let nEdgesDrawn = 0; //same thing as the iterator e I guess, but clearer to use this variable
			for(let e=0; e<M_adj[r][c]; e++){ //iterate through edges between these 2 vertices
				
				//get hit canvas
				let hitCanvas = document.getElementById([Math.min(r,c), Math.max(r,c), e].join("-"));
				if(!hitCanvas){ //if it doesn't exist b/c this is a new edge, create one
					hitCanvas = document.createElement("canvas");
					hitCanvas.id = [Math.min(r,c), Math.max(r,c), e].join("-");
					hitCanvas.className = "hitCanvas";
					hitCanvas.width = canvas.width;
					hitCanvas.height = canvas.height;
					hitCanvases.appendChild(hitCanvas);
				}
				let hitCtx = hitCanvas.getContext("2d");
					//clear hitCanvas so we only draw one thing there at a time
				hitCtx.clearRect(0,0,hitCanvas.width,hitCanvas.height);
				
				
				//reset shadow
				ctx.shadowColor = "rgba(0,0,0,0)";
				ctx.shadowBlur = 0;
				let nTimesToDraw = 1;
				//check if this edge should be shadowed red (for delete mode)
				if(shadowedEdge){
					if(shadowedEdge[0]===Math.min(r,c) && shadowedEdge[1]===Math.max(r,c) && shadowedEdge[2]===e){
						ctx.shadowColor = "rgba(255,0,0,255)";
						ctx.shadowBlur = 10;
						nTimesToDraw = 3; //draw shadowed lines thrice to make them stand out more
					}
				}
				
				
				if(r === c){ //draw loop
					let distance = 100; //distance from the vertex the loop will extend, in px
					let theta; //the angle at which the loop exits the vertex; it will come back further counterclockwise
					let angle; //the angle between the exit of the loop and the return of the loop
					let radius; //the radius of the circle part of the loop
					
					//determine theta and angle
					let howToDraw = loopLocations(getEmptyAngles(r,"straightEdges"), nEdges, Math.PI/6); //returns an array
					theta = howToDraw[nEdgesDrawn].theta;
					angle = howToDraw[nEdgesDrawn].angle;
					
					//determine radius
					let denom = 1 + (1/Math.sin(angle/2));
					radius = distance/denom; //yeah... do the math.
					
					//record first theta in newVertexEdgeAngles if the flag is passed to this function
					let angleRange = []; //will push angleRange to newVertexEdgeAngles (if arg passed) after it has been filled
					if (updateVertexEdgeAngles) {
						angleRange.push(theta-(angle/4)); //include half of gap needed between loops - when determining where to put loops, each loop will be associated with a half gap on both sides
					}
					
					//we will be using ctx.arcTo() - determine the vertex coord and the two control points coords
						//get coords of this vertex
					let x = Number(vertices[r].style.left.split("px")[0]) + 8; // +8 b/c vertices are 16px square
					let y = Number(vertices[r].style.top.split("px")[0]) + 8;
						
						//get distance to control points
					let distToPoint = distance/Math.cos(angle/2);
					
						//get control point coords
					let x1 = (Math.cos(theta) * distToPoint) + x;
					let y1 = (Math.sin(theta) * distToPoint) + y;
					
					theta = theta + angle; //shift theta over
					
					//record 2nd theta in newVertexEdgeAngles if the flag is passed to this function
					if(updateVertexEdgeAngles){
						angleRange.push(theta+(angle/4)); //include gap needed between loops
						newVertexEdgeAngles[r].loops.push(angleRange); //by the way, it was important that the 2nd entry was further counterclockwise
					}
					
					let x2 = (Math.cos(theta) * distToPoint) + x;
					let y2 = (Math.sin(theta) * distToPoint) + y;
					
					
					//draw the loop
					for(let i=0; i<nTimesToDraw; i++){
						ctx.beginPath();
						ctx.moveTo(x,y);
						ctx.arcTo(x1,y1,x2,y2,radius);
						ctx.moveTo(x,y);
						ctx.arcTo(x2,y2,x1,y1,radius);
						ctx.stroke();
					}
					
					//draw on hit canvas too (main and the one specific to this edge), with a blur to increase hit area
					mainHitCtx.shadowColor = "black";
					mainHitCtx.shadowBlur = 10;
					mainHitCtx.beginPath();
					mainHitCtx.moveTo(x,y);
					mainHitCtx.arcTo(x1,y1,x2,y2,radius);
					mainHitCtx.moveTo(x,y);
					mainHitCtx.arcTo(x2,y2,x1,y1,radius);
					mainHitCtx.stroke();
					
					hitCtx.shadowColor = "black";
					hitCtx.shadowBlur = 10;
					hitCtx.beginPath();
					hitCtx.moveTo(x,y);
					hitCtx.arcTo(x1,y1,x2,y2,radius);
					hitCtx.moveTo(x,y);
					hitCtx.arcTo(x2,y2,x1,y1,radius);
					hitCtx.stroke();
					
				} else { //draw normal edge (non-loop)
					
					//get offset of arc - when going from v1 (r) to v2 (c), offset is positive to the right, and negative to the left
					let offset;
					if(nEdges % 2 === 0){ //if even number of edges
						//define offset
						offset = Math.floor(nEdgesDrawn/2) + 1; //get scalar; nEdges=0 or 1 -> offset=1, nEdges=2 or 3 -> offset=2, etc.
						offset *= edgeSpacing; //scale it
						offset -= (0.5*edgeSpacing); //so the 2 middle edges will be also at an even spacing
						offset *= Math.pow(-1,nEdgesDrawn); //add appropriate sign
					}
					else if(nEdges % 2 === 1){ //if odd number of edges
						//define offset
						offset = Math.ceil(nEdgesDrawn/2); //get scalar; nEdges=0 -> offset=0, nEdges=1 or 2 -> offset=1, nEdges=3 or 4 -> offset=2, etc.
						offset *= edgeSpacing; //scale it
						offset *= Math.pow(-1,nEdgesDrawn); //add appropriate sign
					}
									
					//get center of each vertex
					let x1 = Number(vertices[r].style.left.split("px")[0]) + 8;
					let y1 = Number(vertices[r].style.top.split("px")[0]) + 8;
					let x2 = Number(vertices[c].style.left.split("px")[0]) + 8;
					let y2 = Number(vertices[c].style.top.split("px")[0]) + 8;
					
					//get distance between vertices and angle between vertices - this is useful for updating newVertexEdgeAngles
					let distanceBetweenVertices = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
					let angle_v1_to_v2 = Math.acos((x2-x1)/distanceBetweenVertices);
					if(distanceBetweenVertices === 0){angle_v1_to_v2 = 0} //error b/c divide by 0, pick an arbitrary angle (the vertices are on top of each other anyways)
					if(y2-y1 < 0){angle_v1_to_v2 = -angle_v1_to_v2}
					let angle_v2_to_v1 = angle_v1_to_v2 + Math.PI;
					
					if(offset === 0){ //draw straight line
						
						for(let i=0; i<nTimesToDraw; i++){
							ctx.beginPath();
							ctx.moveTo(x1,y1);
							ctx.lineTo(x2,y2);
							ctx.stroke();
						}
						
						//draw on hit canvas too (main and the one specific to this edge), with a blur to increase hit area
						mainHitCtx.shadowColor = "black";
						mainHitCtx.shadowBlur = 10;
						mainHitCtx.beginPath();
						mainHitCtx.moveTo(x1,y1);
						mainHitCtx.lineTo(x2,y2);
						mainHitCtx.stroke();
						
						hitCtx.shadowColor = "black";
						hitCtx.shadowBlur = 10;
						hitCtx.beginPath();
						hitCtx.moveTo(x1,y1);
						hitCtx.lineTo(x2,y2);
						hitCtx.stroke();
						
						//if argument passed to this function and this is the last loop, update newVertexEdgeAngles
						if(updateVertexEdgeAngles && e+1 === M_adj[r][c]){
							newVertexEdgeAngles[r].straightEdges.push([angle_v1_to_v2, angle_v1_to_v2]);
							newVertexEdgeAngles[c].straightEdges.push([angle_v2_to_v1, angle_v2_to_v1]);
						}
						
					} else { //draw arc
						//get center of arc, radius, and angles of arc
						let center = getCenter(x1, y1, x2, y2, offset); //get center of arc in [x,y] form (function below)
						
						let radius = Math.sqrt((x1-center[0])*(x1-center[0]) + (y1-center[1])*(y1-center[1]));
						
						//angle of v1 from center
						let theta_1 = Math.acos((x1-center[0])/radius); //not corrected for quadrant
						if(y1-center[1] < 0){theta_1 = -theta_1} //make angle negative if in quadrant 3 or 4
						
						//angle of v2 from center
						let theta_2 = Math.acos((x2-center[0])/radius); //not corrected for quadrant
						if(y2-center[1] < 0){theta_2 = -theta_2} //make angle negative if in quadrant 3 or 4
						
						if(theta_2 === theta_1){ //the vertices are in the same place
							theta_2 += 2*Math.PI; //so a circle will actually be drawn
						}
						
						//draw arc
						for(let i=0; i<nTimesToDraw; i++){
							ctx.beginPath();
							//make sure we draw the arc in the correct direction
							if(offset > 0){ctx.arc(center[0], center[1], radius, theta_2, theta_1)} //.arc draws clockwise
							if(offset < 0){ctx.arc(center[0], center[1], radius, theta_1, theta_2)}
							ctx.stroke();
						}
						
						//also draw it on the hit canvas (main and specific to this edge), with a blur to increase hit area
						mainHitCtx.shadowColor = "black";
						mainHitCtx.shadowBlur = 10;
							//draw arc
						mainHitCtx.beginPath();
							//make sure we draw the arc in the correct direction
						if(offset > 0){mainHitCtx.arc(center[0], center[1], radius, theta_2, theta_1)}
						if(offset < 0){mainHitCtx.arc(center[0], center[1], radius, theta_1, theta_2)}
						mainHitCtx.stroke();
						
						hitCtx.shadowColor = "black";
						hitCtx.shadowBlur = 10;
							//draw arc
						hitCtx.beginPath();
							//make sure we draw the arc in the correct direction
						if(offset > 0){hitCtx.arc(center[0], center[1], radius, theta_2, theta_1)}
						if(offset < 0){hitCtx.arc(center[0], center[1], radius, theta_1, theta_2)}
						hitCtx.stroke();
						
						//if argument passed to this function and this is the last loop, update vertexEdgeAngles
						if(updateVertexEdgeAngles && e+1 === M_adj[r][c]){
							//based on geometry, the angle range taken up by these edges are the angle from the vertex to the other,
							//plus or minus half the angle difference of center-to-v1 and center-to-v2 (offset determines the order of subtraction)
							
							let angle_diff;
							
							if(offset < 0){ //then get counterclockwise rotation from theta_1 to theta_2 and divide by 2
							//remember (+) offset means arc is to the right when going v1->v2 on the CANVAS(reflected), opposite in normal coordinates
								if(theta_2 < theta_1){theta_2 += 2*Math.PI} //theta_2 needs to be bigger than theta_1 to subtract - but not more than a whole circle maybe
								angle_diff = (theta_2 - theta_1) / 2;
							}
							else if (offset > 0){ //then get counterclockwise rotation from theta_2 to theta_1 and divide by 2
								if(theta_1 < theta_2){theta_1 += 2*Math.PI}
								angle_diff = (theta_1 - theta_2) / 2; //theta_1 needs to be bigger than theta_2 to subtract
							}
							else { //theta_1 = theta_2
								angle_diff = 0.5*Math.PI;
							}
							
								//update vertexEdgeAngles
							newVertexEdgeAngles[r].straightEdges.push([angle_v1_to_v2-angle_diff, angle_v1_to_v2+angle_diff]); //it's important that the 2nd entry is further counterclockwise
							newVertexEdgeAngles[c].straightEdges.push([angle_v2_to_v1-angle_diff, angle_v2_to_v1+angle_diff]);
						}
					}

				} //close if-else for loop vs normal edge
				
				nEdgesDrawn++;
			} //close iteration of edges between these 2 vertices
		}
	} //close edge-drawing iteration
	
	if(updateVertexEdgeAngles){
		vertexEdgeAngles = newVertexEdgeAngles;
	}
}


function getCenter(x1, y1, x2, y2, offset){
	//Args - coord of vertex 1: (x1,y1); coord of vertex 2: (x2,y2); 3rd pt in circle is offset perpendicuar from midpoint, (+) is to the right when traveling v1->v2 in the canvas
	let midpoint = [(x1+x2)/2, (y1+y2)/2];
	
	let distBetweenVertices = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	let b = distBetweenVertices / 2;
	
	let counterOffset = (b*b - offset*offset)/(2*Math.abs(offset)); //the distance to the circle's center from the midpoint
	
	//to get the angle of the counterOffset from the midpoint and thus find the center, add/subtract 90 deg to the angle of the vector from the midpoint to v2
	let theta_1 = Math.acos((x2-x1)/distBetweenVertices); //angle of vector from midpoint to v2, not corrected for quadrant
		//note: I'm calculating based on the vector from vertex 1 to vertex 2, which gives the same angle
	
	if(distBetweenVertices === 0){theta_1 = 0} //dividing by 0 is bad, give it a somewhat arbitrary number b/c vertices are on top of each other
	
	//correct for the quadrant - if in quadrants 1 or 2, it's already correct because of range of arccosine
	if(y2-y1 < 0){theta_1 = -theta_1}
	
	let theta_2 = offset>0 ? theta_1 - Math.PI/2 : theta_1 + Math.PI/2; //if offset is positive, the counterOffset should be rotated pi/2 (90deg) counterclockwise of theta_1, and vice versa
		//theta_2 is the angle from the midpoint to the center
		//remember weird stuff about canvas coords (mirror flip since origin is in top left)
	
	let x_center = (Math.cos(theta_2) * counterOffset) + midpoint[0]; //x-distance from midpoint, plus x of midpoint
	let y_center = (Math.sin(theta_2) * counterOffset) + midpoint[1]; //y-distance from midpoint, plus y of midpoint
	
	return [x_center, y_center];
}