document.addEventListener("click",handleClick);
input_canvas.addEventListener("dblclick",handleDblclick);
document.addEventListener("mousedown",handleMousedown);
document.addEventListener("mouseup",handleMouseup);

document.addEventListener("mousemove",handleMousemove);

document.addEventListener("keydown",handleKeydown);

input_button.addEventListener("click", inputKnot);
generate_concordance_button.addEventListener("click", generateConcordance);

concordance_table.addEventListener("click",displayEntry);



let drawing = false;

//undo/redo storage stuff
let draw_stack = []; //stores State objects corresponding to each change made to the input canvas.
					 //State objects stored in here are copies of the input, never a reference to the input
					 //They also have an additional member variable, last_point_idx, which stores the idx of the point the mouse created most recently for that State
					 //last_point_idx is necessary instead of just storing the point, b/c for undos/redos the input is set from a copy of a State object in here,
						//so any references to Point objects won't work
let draw_stack_idx = 0; //which state in the draw_stack is currently equivalent to the input
let pre_draw_idx = 0; //stores which state we were at before starting drawing, so that we can revert to it if the user presses the Esc key

window.addEventListener("load",function(){
	draw_stack.push(input.getCopy());
});

/* UTILITY FUNCTIONS ---------------------------------------------------------------------------*/

function getLastPoint(){
	let idx = draw_stack[draw_stack_idx].last_point_idx;
	return input.points[idx];
}

function zoom(e, zoom_obj, zoom_factor){ //e is the mouse event that triggered this
	//code adapted from: https://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
	
	let ctx = zoom_obj.ctx;
	let origin = zoom_obj.origin;
	
	//put (0,0) in top left corner
	ctx.translate(origin.x, origin.y);
	
	//Zoom point originally at mouse/old_scale away from top-left corner
	//After zoom, will be at mouse/new_scale away (all in ctx coords).
	//Want those to end up at the same place, so translate the difference
	origin.x += e.offsetX/zoom_obj.scale - e.offsetX/(zoom_obj.scale*zoom_factor);
	origin.y += e.offsetY/zoom_obj.scale - e.offsetY/(zoom_obj.scale*zoom_factor);
	
	ctx.scale(zoom_factor, zoom_factor); //scales relative to the top-left corner of the canvas
	zoom_obj.scale *= zoom_factor;
	
	ctx.translate(-origin.x, -origin.y);
	
	drawEverything(ctx.canvas, ctx.canvas===display_canvas? display : input);
}



/* EVENT HANDLERS -------------------------------------------------------------------------------*/

input_origin = new Point(0,0);

function handleClick(e){
	if(input_zoom.mode === "normal" && e.target === input_canvas){
		handleInputClick(e);
		return;
	}
	
	let input_ctx = input_canvas.getContext("2d");
	let display_ctx = display_canvas.getContext("2d");
	
	//zooming
	if(input_zoom.mode === "zoom-in" && e.target === input_canvas){	
		zoom(e, input_zoom, ZOOM_FACTOR);
	}
	if(input_zoom.mode === "zoom-out" && e.target === input_canvas){
		zoom(e, input_zoom, 1/ZOOM_FACTOR);
	}
	if(display_zoom.mode === "zoom-in" && e.target === display_canvas){
		zoom(e, display_zoom, ZOOM_FACTOR);
	}
	if(display_zoom.mode === "zoom-out" && e.target === display_canvas){
		zoom(e, display_zoom, 1/ZOOM_FACTOR);
	}
	
	//zoom mode selection
	let zoom_class_match = e.target.className.match(/zoom-in|move|zoom-out/);
	if(zoom_class_match !== null){
		let zoom_mode = zoom_class_match[0];
		
		if(/input_zoom/.test(e.target.className)){
			//clear previous selection
			let icons = document.getElementsByClassName("input_zoom");
			for(let i=0; i<icons.length; i++){
				icons[i].style.backgroundColor = "white";
			}
			//set new selection
			if(input_zoom.mode == zoom_mode){
				input_zoom.mode = "normal";
				input_canvas.style.cursor = "default";
			}
			else {
				input_zoom.mode = zoom_mode;
				e.target.style.backgroundColor = "lightblue";
				input_canvas.style.cursor = zoom_mode;
			}
		}
		else if(/display_zoom/.test(e.target.className)){
			//clear previous selection
			let icons = document.getElementsByClassName("display_zoom");
			for(let i=0; i<icons.length; i++){
				icons[i].style.backgroundColor = "white";
			}
			//set new selection
			if(display_zoom.mode == zoom_mode){
				display_zoom.mode = "normal";
				display_canvas.style.cursor = "default";
			}
			else {
				display_zoom.mode = zoom_mode;
				e.target.style.backgroundColor = "lightblue";
				display_canvas.style.cursor = zoom_mode;
			}
		}
	}
	
}


function handleInputClick(e){	
	//update stuff to account for zoom
	let mouseX = (e.offsetX/input_zoom.scale) + input_zoom.origin.x;
	let mouseY = (e.offsetY/input_zoom.scale) + input_zoom.origin.y;
	
	//just print out coords if it was a shift click
	if(e.shiftKey){
		console.log(mouseX, mouseY);
		return;
	}
	
	let ctx = input_canvas.getContext("2d");
	
	let last_point = getLastPoint();
	let new_point;
	
	if(hovered_point){
		//check for crossing flip. Also don't want to start a drawing at a previous point
		if(!drawing && hovered_point){
			if(hovered_point.isCrossing()){
				hovered_point.flipCrossing();
				drawEverything(input_canvas, input);
			}
			return;
		}
		//don't draw when hovering over a point, unless to an endpoint that's not the last point (to avoid 1-point drawings)
		if(!hovered_point.endpoint || hovered_point === last_point){return;}
	}
	
	//if not previously drawing, save the canvas state
	if(!drawing){
		pre_draw_idx = draw_stack_idx;
	}
	
	drawing = true;
	
	//get the new point
	if(hovered_point && hovered_point.endpoint){ //if hovering over an endpoint, draw to that point instead of making a new one
		new_point = hovered_point;
		hovered_point.endpoint = false; //no longer a valid endpoint
		drawing = false; //finished this drawing
	}
	else {
		new_point = input.newPoint(mouseX, mouseY);
		new_point.endpoint = (last_point == undefined); //only the first point drawn is a valid endpoint
	}
	
	//add a strand from the previous point to this one
	if(last_point != undefined){
		input.newStrand(last_point, new_point);
	}
	
	//stuff for not drawing anymore
	if(drawing == false){
		input.updateRegions();
	}
	
	//draw_stack stuff
	if(draw_stack_idx != draw_stack.length-1){
		draw_stack.splice(draw_stack_idx+1); //delete everything after current state
	}
	let new_state = input.getCopy();
	let last_point_idx = drawing ? input.points.indexOf(new_point) : undefined;
	new_state.last_point_idx = last_point_idx;
	if(last_point_idx){
		new_state.points[new_state.last_point_idx].endpoint = true; //by default, store endpoints as if we're not drawing
	}
	draw_stack.push(new_state);
	draw_stack_idx++;
	
	drawEverything(input_canvas, input);
	
	//update hovered point
	handleMousemove(e);
}

function handleDblclick(e){
	let last_point = getLastPoint();
	
	//test for end drawing w/o closing the loop
	if(hovered_point && hovered_point == last_point){ //last_point must be defined for this to work - correct
		last_point.endpoint = true;
		drawing = false;
		draw_stack[draw_stack_idx].last_point_idx = undefined;
		input.updateRegions();
	}
	//test for resume drawing at a certain point
	else if(!drawing && hovered_point && hovered_point.endpoint){
		drawing = true;
		draw_stack[draw_stack_idx].last_point_idx = input.points.indexOf(hovered_point); //hovered_point is guaranteed to be in input.points
		if(hovered_point.strands.length > 0){
			hovered_point.endpoint = false;
		}
		
		drawEverything(input_canvas, input);
	}
}


function handleMousedown(e){
	if(e.target === input_canvas && input_zoom.mode === "move"){
		input_zoom.dragging = true;
		input_zoom.mouse.x = e.offsetX;
		input_zoom.mouse.y = e.offsetY;
	}
	if(e.target === display_canvas && display_zoom.mode === "move"){
		display_zoom.dragging = true;
		display_zoom.mouse.x = e.offsetX;
		display_zoom.mouse.y = e.offsetY;
	}
}

function handleMouseup(e){
	input_zoom.dragging = false;
	display_zoom.dragging = false;
}


function handleMousemove(e){	
	if(e.target === input_canvas){
		if(input_zoom.dragging){
			let dx = (e.offsetX - input_zoom.mouse.x)/input_zoom.scale;
			let dy = (e.offsetY - input_zoom.mouse.y)/input_zoom.scale;
			input_zoom.ctx.translate(dx,dy);
			input_zoom.origin.x -= dx;
			input_zoom.origin.y -= dy;
			drawEverything(input_canvas, input);
			
			input_zoom.mouse.x = e.offsetX;
			input_zoom.mouse.y = e.offsetY;
		}
		else {
			handleInputMousemove(e);
		}
	}
	else {
		input_zoom.dragging = false; //stop dragging if mouse is not in the canvas
	}
	
	if(e.target === display_canvas && display_zoom.dragging){
		let dx = (e.offsetX - display_zoom.mouse.x)/display_zoom.scale;
		let dy = (e.offsetY - display_zoom.mouse.y)/display_zoom.scale;
		display_zoom.ctx.translate(dx,dy);
		display_zoom.origin.x -= dx;
		display_zoom.origin.y -= dy;
		if(display){drawEverything(display_canvas, display);}
		
		display_zoom.mouse.x = e.offsetX;
		display_zoom.mouse.y = e.offsetY;
	}
	else {
		display_zoom.dragging = false; //stop dragging if mouse is not in the canvas
	}
}




let hovered_point = undefined;
function handleInputMousemove(e){
	//if drawing, highlight when move over endpoints
	//if not drawing, highlight any point
	
	//update stuff to account for zoom
	let point_select_radius = POINT_SELECT_RADIUS/input_zoom.scale;
	let mouseX = (e.offsetX/input_zoom.scale) + input_zoom.origin.x;
	let mouseY = (e.offsetY/input_zoom.scale) + input_zoom.origin.y;
	
	//check if hovering over a point
	for(let i=0; i<input.points.length; i++){
		let p = input.points[i];
		let dist = Math.hypot(mouseX - p.x, mouseY - p.y);
		
		if(dist <= point_select_radius){
			hovered_point = p;
			
			if(drawing && (p.endpoint || p == getLastPoint()) || !drawing){
				//highlight the point
				drawEverything(input_canvas, input);
				let ctx = input_canvas.getContext("2d");
				ctx.lineWidth = 1/input_zoom.scale;
				ctx.beginPath();
				ctx.arc(p.x, p.y, point_select_radius, 0, 2*Math.PI);
				ctx.closePath();
				ctx.stroke();
				
				ctx.lineWidth = 1;
			}
			return; //stop looking for points
		}
	}
	hovered_point = undefined;
	drawEverything(input_canvas, input); //reset the display
}



function handleKeydown(e){	
	
	//testing utility for running the band algorithm
	if(e.key === "b" && e.ctrlKey){
		input = draw_stack[draw_stack.length-1].getCopy();
		drawEverything(input_canvas, input);
		b = new Band(input,50,50);
		runBandAlgorithm(b,3);
	}
	
	
	if(e.key === "Escape" && drawing){
		drawing = false;
		
		draw_stack_idx = pre_draw_idx;
		input = draw_stack[pre_draw_idx].getCopy();
		draw_stack.splice(pre_draw_idx+1); //remove everything after pre_draw_idx
		
		drawEverything(input_canvas, input);
	}
	
	if(e.key.toLowerCase() === "z" && e.ctrlKey){
		if(e.shiftKey){
			//redo
			draw_stack_idx = Math.min(draw_stack_idx+1, draw_stack.length-1);
		}
		else {
			//undo
			draw_stack_idx = Math.max(draw_stack_idx-1, 0);
		}
		
		input = draw_stack[draw_stack_idx].getCopy();
		if(!drawing){
			draw_stack[draw_stack_idx].last_point_idx = undefined;
				//necessary b/c otherwise we'll undo and then a new click will draw from the 'last point' associated w/ the state, instead of starting a new component
		}
		drawEverything(input_canvas, input);
	}
}



/* NON EVENT HANDLER FUNCTIONS ----------------------------------------------------------*/

function drawEverything(canvas, state){
	let ctx = canvas.getContext("2d");
	
	//get zoom object
	let zoom_obj;
	if(canvas===input_canvas){zoom_obj = input_zoom;}
	else if(canvas===display_canvas){zoom_obj = display_zoom;}
	else {throw new Error("invalid canvas");}
	
	//clear canvas
	ctx.clearRect(zoom_obj.origin.x, zoom_obj.origin.y, canvas.width/zoom_obj.scale, canvas.height/zoom_obj.scale);
	
	if(canvas == input_canvas){
		canvas.style.backgroundColor = drawing? "lightgrey" : "white";
	}
	
	//draw strands
	for(let s=0; s<state.strands.length; s++){
		state.strands[s].draw(ctx);
	}
	
	//draw points not connected to strands
	for(let p=0; p<state.points.length; p++){
		if(state.points[p].strands.length == 0){
			state.points[p].show(canvas);
		}
	}
}


function newTableEntry(state, original=false){
	let tr = document.createElement("tr");
	tr.className = "entry";
	tr.id = entries.length;
	
	let td_id = document.createElement("td");
	td_id.textContent = original? "Original" : entries.length;
	tr.appendChild(td_id);
	
	let td_alexander = document.createElement("td");
	td_alexander.innerHTML = state.getAlexander(true); //for_html is 'true'
	td_alexander.className = "justify_right";
	tr.appendChild(td_alexander);
	
	let td_PD = document.createElement("td");
	td_PD.textContent = state.getPD();
	tr.appendChild(td_PD);
	
	concordance_table.tBodies[0].appendChild(tr);
	concordance_table.scrollTop = concordance_table.scrollHeight;
	
	entries.push(state);
	
	displayEntry({target:tr}); //putting a fake event object here, but it has the necessary property so can use this function
}


function inputKnot(){
	if(input.strands.length == 0){
		console.log("No strands in input, can't add it");
		return;
	}
	
	newTableEntry(input.getCopy(), true);
	generate_concordance_button.disabled = false;
}


function generateConcordance(){	
	let new_state;
	let n_errors = 0;
	while(n_errors < 100){
		try {
			new_state = input.getCopy();
			let band = new Band(new_state, 50, 50);
			runBandAlgorithm(band, 4);
			break;
		}
		catch(error){console.log(error)}
		n_errors++;
	}
	console.log("Number errors when generating: "+n_errors);
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
	
	display = entries[Number(target.id)]; //display is a global variable storing the displayed State object
	
	drawEverything(display_canvas, display);
}