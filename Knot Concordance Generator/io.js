input_canvas.addEventListener("click",handleClick);
input_canvas.addEventListener("dblclick",handleDblclick);
input_canvas.addEventListener("mousemove",handleMousemove);

input_button.addEventListener("click", inputKnot);
generate_concordance_button.addEventListener("click", generateConcordance);

concordance_table.addEventListener("click",displayEntry);


let cur_point = undefined;
let drawing = false;

function handleClick(e){	
	//just print out coords if it was a shift click
	if(e.shiftKey){
		console.log(e.offsetX, e.offsetY);
		return;
	}
	
	let ctx = input_canvas.getContext("2d");
	
	if(hovered_point){
		//check for crossing flip. Also don't want to start a drawing at a previous point
		if(!drawing && hovered_point){
			if(hovered_point.isCrossing()){
				hovered_point.flipCrossing();
				drawEverything(input_canvas, input);
			}
			return;
		}
		//don't draw when hovering over a point, unless to an endpoint (btw, cur_point is not an endpoint based on my logic)
		if(!hovered_point.endpoint){return;}
	}
	
	drawing = true;
	let last_point = cur_point;
	
	//get the new point
	if(hovered_point && hovered_point.endpoint){ //if hovering over an endpoint, draw to that point instead of making a new one
		cur_point = hovered_point;
		hovered_point.endpoint = false; //no longer a valid endpoint
		drawing = false; //finished this drawing
	}
	else {
		cur_point = input.newPoint(e.offsetX, e.offsetY);
		cur_point.endpoint = (last_point == undefined); //only the first point drawn is a valid endpoint
	}
	
	//add a strand from the previous point to this one
	if(last_point != undefined){
		input.newStrand(last_point, cur_point);
	}
	
	//cleanup for not drawing anymore
	if(drawing == false){
		cur_point = undefined;
	}
	
	drawEverything(input_canvas, input);
	
	//update hovered point
	handleMousemove(e);
}

function handleDblclick(e){
	//test for end drawing w/o closing it
	if(hovered_point && hovered_point == cur_point){
		cur_point.endpoint = true;
		drawing = false;
		cur_point = undefined;
	}
	//test for resume drawing at a certain point
	else if(!drawing && hovered_point){
		drawing = true;
		cur_point = hovered_point;
		cur_point.endpoint = false;
		
		drawEverything(input_canvas, input);
	}
}



let hovered_point = undefined;
function handleMousemove(e){
	if(e.ctrlKey){console.log(e.offsetX,e.offsetY);return;}
	
	//if drawing, highlight when move over endpoints
	//if not drawing, highlight any point
		
	//check if hovering over a point
	for(let i=0; i<input.points.length; i++){
		let p = input.points[i];
		let dist = Math.sqrt((e.offsetX - p.x)**2 + (e.offsetY - p.y)**2);
		
		if(dist <= POINT_SELECT_RADIUS){
			hovered_point = p;
			
			if(drawing && (p.endpoint || p == cur_point) || !drawing){
				//highlight the point
				drawEverything(input_canvas, input);
				let ctx = input_canvas.getContext("2d");
				ctx.beginPath();
				ctx.arc(p.x, p.y, POINT_SELECT_RADIUS, 0, 2*Math.PI);
				ctx.closePath();
				ctx.stroke();
			}
			break; //stop looking for points
		}
		else {
			hovered_point = undefined;
			drawEverything(input_canvas, input); //reset the display
		}
	}
}


function drawEverything(canvas, state){
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	if(canvas == input_canvas){
		canvas.style.backgroundColor = drawing? "lightgrey" : "white";
	}
	
	//draw strands
	for(let s=0; s<state.strands.length; s++){
		state.strands[s].draw(ctx);
	}
}


function newTableEntry(state){
	let tr = document.createElement("tr");
	tr.className = "entry";
	tr.id = entries.length;
	
	let td_id = document.createElement("td");
	td_id.textContent = state===input? "Original" : entries.length;
	tr.appendChild(td_id);
	
	let td_PD = document.createElement("td");
	td_PD.textContent = state.getPD();
	if(state===input){original_PD_display = td_PD;}
	tr.appendChild(td_PD);
	
	concordance_table.tBodies[0].appendChild(tr);
	
	entries.push(state);
	
	drawEverything(display_canvas, state);
}


function inputKnot(){
	if(input.strands.length == 0){
		console.log("No strands in input, can't add it");
		return;
	}
	
	newTableEntry(input);
	original_PD_display.textContent = input.getPD();
	generate_concordance_button.disabled = false;
}


function generateConcordance(){
	let new_state = input.getCopy();
	let path = generatePath(new_state);
	new_state.applyPath(path);
	newTableEntry(new_state);
}


function displayEntry(e){
	//get the tr as our target, filter out other stuff
	let target = e.target;
	if(target.tagName !== "TR"){
		target = target.parentElement;
	}
	if(target.tagName !== "TR" || target.className !== "entry"){return;}
	
	//remove highlighting from other entries, add it to this one
	let tr_entries = document.getElementsByClassName("entry");
	for(let i=0; i<tr_entries.length; i++){
		tr_entries[i].style.backgroundColor = "";
	}
	target.style.backgroundColor = "#ffee99";
	
	drawEverything(display_canvas, entries[Number(target.id)]);
}