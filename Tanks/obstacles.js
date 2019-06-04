//obstacles are polygons - must be convex (for the collision function to work). Construct concave obstacles out of multiple convex ones
function Obstacle(){ //must be at least 3 vertices (separate arguments), going around the polygon, of form [x,y]
	//we will use the 'arguments' object to get arguments
	//to disable fun version for this obstacle, pass the last argument after all the vertices as 'false'
	
	//convert arguments object to an array
	args = Array.from(arguments);
	
	//check if we should disable fun version
	if(typeof args[args.length-1] !== "object" && args[args.length-1] === false){
		this.fun_version_disabled = true;
		
		//now remove that arg out of the vertices list
		args.splice(args.length-1, 1);
	} else {
		this.fun_version_disabled = false;
	}

	
	this.vertices = args;
	if(this.vertices.length < 3){
		throw new Error("Obstacle objects must have at least 3 vertices");
	}
	
	this.color = obstacleColor; //global config value
	
	//determine center of obstacle by averaging vertices
	this.center = [0,0];
	for(let v=0; v<this.vertices.length; v++){
		this.center[0] += this.vertices[v][0];
		this.center[1] += this.vertices[v][1];
	}
	this.center[0] /= this.vertices.length;
	this.center[1] /= this.vertices.length;
	
	
	
	//fun version stuff!!(updatePosition only called by main loop if global far fun_version is true)
	//------------------------------------------------------------------------
	//store where the obstacle normally is in unchanging variables
	this.normal_vertices = deepCopy(this.vertices);
	this.normal_center = deepCopy(this.center)
	
	//movement (oscillation) variables
	this.movement_angle = 2*Math.PI*Math.random();
	this.initial_phase = 2*Math.PI*Math.random();
	this.cycle_duration = (max_cycle_duration-min_cycle_duration)*Math.random() + min_cycle_duration; //variables are global config
	this.max_offset = (max_offset-min_offset)*Math.random() + min_offset; //variables are global config
	this.t0 = performance.now(); //the time right now in milliseconds
	
	//then in the function below which will be called by the main loop,
	//we'll do sin(function of time passed + initial_phase) to get distance from normal position, and then use movement_angle to figure out which way to go
	//we'll then add the x and y displacement to all the vertices and the center
	//the main loop will then call the draw function
	
	this.updatePosition = function(){
		if(this.fun_version_disabled){return}
		
		let n_cycles_completed = (performance.now() - this.t0)/this.cycle_duration;
		let phase = 2*Math.PI*n_cycles_completed + this.initial_phase;
		let offset = this.max_offset*Math.sin(phase);
		let dx = offset*Math.cos(this.movement_angle);
		let dy = offset*Math.sin(this.movement_angle);
		
		//now update the coordinates
		for(let v=0; v<this.vertices.length; v++){
			this.vertices[v][0] = this.normal_vertices[v][0] + dx;
			this.vertices[v][1] = this.normal_vertices[v][1] + dy;
		}
		this.center[0] = this.normal_center[0] + dx;
		this.center[1] = this.normal_center[1] + dy;
	}
	//end of fun version stuff ----------------------------------------
	
	
	//function to detect collision between this obstacle and another convex polygon or circle
	//if collision, returns the theta_normal of the collision, and the overlap in that direction: {theta_normal:?, overlap:?}
	//if no collision, returns false
	this.detectCollision = function(shape){
		//shape is an object: {type:"circle/polygon", vertices (if polygon):[[x1,y1],[x2,y2],etc...must be in counterclockwise direction,clockwise on canvas], radius(if circle):?, center(if circle):[x,y]}
		
		let obstacle = this; //so we can reference it inside functions that are defined inside this function
		
		//use the separating axis theorem algorithm
		//for each edge on both shapes, project both shapes onto a line ("axis") perpendicular to the edge
			//for circles, also need to check the axis in same direction as center of circle to the nearest vertex of the polygon
		//if there's a gap on one of the axes, no collision. If no gap on all axes, collision.
		
		let overlaps = [
			//format of overlap object: {axis: [?,?], overlap: ?} //overlap is distance along axis of overlap
		];
		//overlapExists() will fill this array with overlaps if it finds them
		//if there is definitely a collision, we will then determine which overlap has the smallest size ('overlap') so we can return it
		
		//function to test an axis, if overlap, returns true and pushes an overlap object to the overlaps array
		//if no overlap, returns false
		let overlapExists = function(axis){ //axis a vector of form [x,y], assumed to go in the same direction as the normal away from the obstacle
			//console.log(axis,"axis");
			//to project a point onto the axis, find the vector from the origin (0,0) to the point and project that onto a vector in the correct direction
			//the "magnitude" (with sign) of the resulting vector is the coordinate along the axis.
			
			let o_proj = [Infinity, -Infinity]; //obstacle projection: [min coord, max coord]
			let s_proj = [Infinity, -Infinity]; //shape projection: [min coord, max coord]
			
			//project obstacle
			//loop through obstacle vertices
			for(let v=0; v<obstacle.vertices.length; v++){
				let vector = obstacle.vertices[v];
				let signed_proj_mag = (vector[0]*axis[0] + vector[1]*axis[1]) / Math.sqrt(axis[0]**2 + axis[1]**2);
				
				if(signed_proj_mag < o_proj[0]){o_proj[0] = signed_proj_mag}
				if(signed_proj_mag > o_proj[1]){o_proj[1] = signed_proj_mag}
			}
			
			//project shape
			if(shape.type === "circle"){
				let vector = shape.center;
				let signed_proj_mag = (vector[0]*axis[0] + vector[1]*axis[1]) / Math.sqrt(axis[0]**2 + axis[1]**2);
				
				s_proj = [signed_proj_mag - shape.radius, signed_proj_mag + shape.radius];
			}
			else if (shape.type === "polygon"){
				//loop through shape vertices
				for(let v=0; v<shape.vertices.length; v++){
					let vector = shape.vertices[v];
					let signed_proj_mag = (vector[0]*axis[0] + vector[1]*axis[1]) / Math.sqrt(axis[0]**2 + axis[1]**2);
					
					if(signed_proj_mag < s_proj[0]){s_proj[0] = signed_proj_mag}
					if(signed_proj_mag > s_proj[1]){s_proj[1] = signed_proj_mag}
				}
			}
			else {throw new Error("Obstacle collision detection: Cannot determine type of shape")}
			//console.log("o_proj",o_proj);
			//console.log("s_proj",s_proj);
			//determine if the projections overlap
			let dist_1 = Math.abs(o_proj[0] - s_proj[1]);
			let dist_2 = Math.abs(o_proj[1] - s_proj[0]);
				//one of these distances will be the full range that the projections take up
				//the other will be the size of the gap/overlap
			
			let min_dist = Math.min(dist_1, dist_2); //this is the size of the gap/overlap
			let max_dist = Math.max(dist_1, dist_2); //this is the size of the range
			
			let o_length = Math.abs(o_proj[1] - o_proj[0]); //Math.abs to be safe, shouldn't need it but who knows
			let s_length = Math.abs(s_proj[1] - s_proj[0]);
			
			if(! (o_length + min_dist + s_length > max_dist + 0.00001) ) { //then no overlap; the +0.00001 is for POTENTIAL floating point error
				//console.log("no overlap");
				return false;
			}
			else {
				overlaps.push( {axis:axis, overlap:min_dist} ); //getAngle() is defined in tests.js; axis is assumed to point in direction of theta_normal
				//console.log("overlap");
				return true;
			}
		}
		
		//function to test all of the axes coming from the edges of a polygon - to avoid duplicate code
		let testPolygonAxes = function(vertices){ //polygon defined by an array of its vertices, arranged clockwise or counterclockwise
			//returns false if a gap is found, true if no gap found
			for(let v=0; v<vertices.length; v++){
				let v1 = vertices[v];
				let v2 = vertices[(v+1) % vertices.length];
				//console.log("v1",v1);
				//console.log("v2",v2);
				let theta_edge = getAngle(v1,v2); //getAngle() defined in tests.js
				//console.log("theta_edge",theta_edge);
				let theta_axis = theta_edge + (Math.PI/2);
				
				let axisToTest = [Math.cos(theta_axis), Math.sin(theta_axis)];
				if( ! overlapExists(axisToTest) ){
					return false; //if there's a gap, this isn't a collision
				}
			}
			return true; //if got here, means no gaps found for all the axes generated by this polygon's edges
		}
		
		//go through and test the axes
		//test axes from this obstacle
		if( ! testPolygonAxes(this.vertices,"counterclockwise") ) { //then a gap was found - no collision
			return false;
		}
		//test axes from the shape
		if(shape.type === "polygon"){
			if( ! testPolygonAxes(shape.vertices, "clockwise") ) { //then a gap was found - no collision
				return false;
			}
		}
		else if(shape.type === "circle"){
			//check axis from the circle center to the nearest vertex on the obstacle
			//find that axis
			let min_dist = Infinity;
			let axisToTest;
			for(let v=0; v<this.vertices.length; v++){
				let vertex = this.vertices[v];
				let dist = Math.sqrt( (shape.center[0]-vertex[0])**2 + (shape.center[1]-vertex[1])**2 );
				if(dist < min_dist){
					min_dist = dist;
					axisToTest = [ shape.center[0]-vertex[0], shape.center[1]-vertex[1] ]; //points away from obstacle, same direction as theta_normal
				}
			}
			//test the axis
			if( ! overlapExists(axisToTest) ){ //then gap exists, no collision
				return false;
			}
		}
		else {throw new Error("Obstacle collision detection: Cannot determine type of shape")}
		
		//if we got here without returning false, that means that no gaps were found - we have a collision
		console.log("COLLISION!!!!!!");
		console.log("overlaps",overlaps);
		//find the overlap object(s) with the smallest overlap
		let min_overlap = Infinity;
		let overlap_obj;
		for(let o=0; o<overlaps.length; o++){
			if(overlaps[o].overlap < min_overlap + 0.00001){ //0.00001 to allow for ties between same-sized overlaps
				min_overlap = overlaps[o].overlap;
				overlap_obj = overlaps[o];
			}
		}
		
		//convert axis of overlap_obj to a theta_normal so we can return it
		let theta_axis = getAngle([0,0], overlap_obj.axis); //getAngle() defined in tests.js
		let theta_normal; //can be equal to theta_axis or theta_axis+pi
		
			//figure out which direction for the normal is closer to going: center-of-obstacle -> center-of-shape, that's the correct one
			//determine the center of the shape if we don't know it, by averaging the vertices
		if(!shape.center){
			if(!shape.vertices){throw new Error("Can't find center of shape b/c there are no vertices")}
			shape.center = [0,0];
			for(let v=0; v<shape.vertices.length; v++){
				shape.center[0] += shape.vertices[v][0];
				shape.center[1] += shape.vertices[v][1];
			}
			shape.center[0] /= shape.vertices.length;
			shape.center[1] /= shape.vertices.length;
		}
		
		let theta_o_to_s = getAngle(this.center, shape.center);
		
		if( Math.abs(angleDiff(theta_axis, theta_o_to_s)) < Math.abs(angleDiff(theta_axis + Math.PI, theta_o_to_s)) ) { //angleDiff() defined in tests.js
			theta_normal = theta_axis;
		} else {
			theta_normal = theta_axis+Math.PI;
		}
		console.log("theta_normal",theta_normal);
		//return the information about the collision
		return({theta_normal:theta_normal, overlap:overlap_obj.overlap});
	}
	
	this.draw = function(ctx){
		ctx.strokeStyle = "black";
		ctx.fillStyle = this.color;
		
		ctx.beginPath();
		ctx.moveTo(this.vertices[0][0], this.vertices[0][1]);
		for(let v=1; v<this.vertices.length; v++){
			ctx.lineTo(this.vertices[v][0], this.vertices[v][1]);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}


//OBSTACLE GENERATION -----------------------------------------------------------------------------
//obstacles will be generated along a grid laid over the canvas
//2 types of obstacles: LargeObstacles, which take up whole or parts of grid squares, and WallObstacles, which take up grid lines
//both types are subsets of the generic CustomObstacle class defined below
	//obstacle.place(r,c) is defined differently for LargeObstacles vs WallObstacles

//for both LargeObstacles and WallObstacles:
//vertex_array is an array, [r][c], of grid intersections.
	//Consecutive numbers are placed where vertices are to be drawn, in the order of drawing them
	//0s are placed where nothing is to be drawn
//footprint is an array representing the smallest box that can fit around this obstacle AND its surrounding -1s
	//1=this obstacle there, 0=unused spot, -1=no other obstacle can be there in order to place this one


function LargeObstacle(vertex_array,footprint){
	
	this.vertex_array = vertex_array;
	this.footprint = footprint;
	
	//function to place the obstacle; this function will give the obstacle all of the properties of an Obstacle and add it to the obstacles array
	//r,c, is the top-left row and column of the footprint
	this.place = function(r,c){
		let square_width = canvas.width/nCols;
		let square_height = canvas.height/nRows;
		//get reference x and y (top left of box containing this obstacle
		let x_ref = c * square_width;
		let y_ref = r * square_height;
		
		//get vertices
		let vertices = [];
		let v_cur = 1; //number of current vertex: 1,2,3, etc. (see vertex_array syntax above)
		//iterate through vertices
		console.log("varr",vertex_array);
		vertex_iteration:
		while(true){
			//iterate through vertex_array, searching for current vertex
			for(let i=0; i<vertex_array.length; i++){
				for(let j=0; j<vertex_array[0].length; j++){
					if(vertex_array[i][j] === v_cur){
						let x = j*square_width + x_ref;
						let y = i*square_height + y_ref;
						vertices.push([x,y]);
						
						v_cur++;
						continue vertex_iteration;
					}
				}
			}
			//if got through vertex_array without finding it, then no more vertices
			break;
		}
		
		//mark this obstacle in the obstacleGrid
		for(let r_foot=0; r_foot<footprint.length; r_foot++){
			for(let c_foot=0; c_foot<footprint[0].length; c_foot++){
				if(r+r_foot >=0 && r+r_foot < obstacleGrid.length && c+c_foot >=0 && c+c_foot < obstacleGrid[0].length){
					obstacleGrid[r+r_foot][c+c_foot] = footprint[r_foot][c_foot];
				}
			}
		}
		console.log("obstacle grid",obstacleGrid);
		
		//call parent constructor
		Obstacle.apply(this,vertices);
		console.log(this);
	}
	
	//function to search the obstacle grid for a place to put this obstacle, and will call this.place() if it finds a place
	//will return true if found a spot to place the obstacle, false if not
	this.tryToPlace = function(){
		//find top-left coords of smallest box surrounding obstacle, in terms of r,c in the footprint array
		let r_offset;
		let c_offset;
		for(let r=0; r<footprint.length && r_offset===undefined; r++){
			for(let c=0; c<footprint[0].length && c_offset===undefined; c++){
				if(footprint[r][c] === 1){
					r_offset = r;
					c_offset = c;
				}
			}
		}
		//find bottom_right coords of smallest box surrounding obstacle, in terms of r,c in the footprint array
		let r_max_offset;
		let c_max_offset;
		for(let r = footprint.length-1; r>=0 && r_max_offset===undefined; r--){
			for(let c = footprint[0].length-1; c>=0 && c_max_offset===undefined; c--){
				if(footprint[r][c] === 1){
					r_max_offset = r;
					c_max_offset = c;
				}
			}
		}
		if(r_offset===undefined || c_offset===undefined || r_max_offset===undefined || c_max_offset===undefined){
			console.log(r_offset,c_offset,r_max_offset,c_max_offset);
			throw new Error("Could not find footprint offsets in LargeObstacle");
		}
		console.log("offset",r_offset,c_offset);
		console.log("max_offset", r_max_offset, c_max_offset);
		
		//method:
		//1 - pick random location 
		//2 - test if obstacle can go there
			//if yes, call this.place(), return true
			//if no, try again
		//3 - end loop if exceeded nAttemptsToPlaceObstacle (global config), return false
		
		let height = r_max_offset - r_offset + 1;
		let width = c_max_offset - c_offset + 1;
		
		attempt_loop:
		for(let attempt = 0; attempt < nAttemptsToPlaceObstacle; attempt++){
			console.log("attempt "+attempt+" to place obstacle");
			//pick random location (top left coord of footprint)
			let r_try = Math.floor( (nRows+1 - height) * Math.random() ) - r_offset; //nRows and nCols are global config
			let c_try = Math.floor( (nCols+1 - width) * Math.random() ) - c_offset;
			
			//test if we can go there - iterate over footprint
			for(let r_foot=0; r_foot<footprint.length; r_foot++){
				for(let c_foot=0; c_foot<footprint[0].length; c_foot++){
					
					//do a buffer for indexing into the obstacleGrid because some of the footprint might not be in the grid - don't want an error
					let gridsquare = obstacleGrid[r_try+r_foot]===undefined ? undefined : obstacleGrid[r_try+r_foot][c_try+c_foot];
					if(gridsquare === undefined){continue}
					
					//if footprint is 1, obstacleGrid needs to be 0
					if(footprint[r_foot][c_foot] === 1 && gridsquare !== 0){ //obstacleGrid is global var
						continue attempt_loop;
					}
					
					//if footprint is 0, it doesn't matter what obstacleGrid is
					
					//if footprint is -1, obstacleGrid needs to be 0 or -1
					if(footprint[r_foot][c_foot] === -1 && gridsquare === 1){
						continue attempt_loop;
					}
				}
			}
			//if made it here without continuing attempt loop, we can place!
			console.log("Can place at: "+r_try+", "+c_try+"!");
			this.place(r_try,c_try); //defined in LargeObstacle or WallObstacle
			return true;
		}
		return false;
	}
}


function WallObstacle(vertex_array, footprint){ //difference from LargeObstacle: vertex_array should only contain 2 vertices, which the wall will be drawn between
	
	//function to place the obstacle; this function will give the obstacle all of the properties of an Obstacle and add it to the obstacles array
	//r,c, is the top-left row and column of the footprint
	this.place = function(r,c){
		let square_width = canvas.width/nCols;
		let square_height = canvas.height/nRows;
		//get reference x and y (top left of footprint)
		let x_ref = c * square_width;
		let y_ref = r * square_height;
		
		//get vertices
		let points = []; //2 of these, they are the endpoints of the wall
		let vertices = []; //4 of these, form a skinny rectangle, what's actually used to draw the wall
		let p_cur = 1; //number of current point: 1,2,3, etc. (see vertex_array syntax above)
		//iterate through points
		point_iteration:
		while(p_cur <= 2){
			//iterate through vertex_array, searching for current point
			for(let i=0; i<vertex_array.length; i++){
				for(let j=0; j<vertex_array[0].length; j++){
					if(vertex_array[i][j] === p_cur){
						let x = j*square_width + x_ref;
						let y = i*square_height + y_ref;
						points.push([x,y]);
						
						p_cur++;
						continue point_iteration;
					}
				}
			}
		}
		//get vertices using points
		let dx = Math.abs(points[1][0] - points[0][0]);
		let dy = Math.abs(points[1][1] - points[0][1]);
		let horiz_orient = dx > dy;
		
		if(horiz_orient){
			vertices.push( [points[0][0], points[0][1]+0.5*wallWidth] );
			vertices.push( [points[0][0], points[0][1]-0.5*wallWidth] );
			vertices.push( [points[1][0], points[1][1]-0.5*wallWidth] );
			vertices.push( [points[1][0], points[1][1]+0.5*wallWidth] );
		}
		else {
			vertices.push( [points[0][0]+0.5*wallWidth, points[0][1]] );
			vertices.push( [points[0][0]-0.5*wallWidth, points[0][1]] );
			vertices.push( [points[1][0]-0.5*wallWidth, points[1][1]] );
			vertices.push( [points[1][0]+0.5*wallWidth, points[1][1]] );
		}
		
		console.log("footprint",footprint);
		//mark this obstacle in the obstacleGrid
		for(let r_foot=0; r_foot<footprint.length; r_foot++){
			for(let c_foot=0; c_foot<footprint[0].length; c_foot++){
				if(r+r_foot < obstacleGrid.length && c+c_foot < obstacleGrid[0].length){
					obstacleGrid[r+r_foot][c+c_foot] = footprint[r_foot][c_foot];
				}
			}
		}
		console.log("obstacle grid",obstacleGrid);
		
		//call parent constructor
		Obstacle.apply(this,vertices);
		//console.log(this);
	}
	
	
	//function to search the obstacle grid for a place to put this obstacle, and will call this.place() if it finds a place
	//will return true if found a spot to place the obstacle, false if not
	this.tryToPlace = function(){
		
		//method:
		//1 - pick random location 
		//2 - test if obstacle can go there
			//if yes, call this.place(), return true
			//if no, try again
		//3 - end loop if exceeded nAttemptsToPlaceObstacle (global config), return false
		
		let height = footprint.length;
		let width = footprint[0].length;
		
		attempt_loop:
		for(let attempt = 0; attempt < nAttemptsToPlaceObstacle; attempt++){
			console.log("attempt "+attempt+" to place obstacle");
			//pick random location (top left coord of footprint)
			let r_try = Math.floor( (nRows+1 - height) * Math.random() ); //nRows and nCols are global config
			let c_try = Math.floor( (nCols+1 - width) * Math.random() );
			
			//test if we can go there - iterate over footprint
			for(let r_foot=0; r_foot<footprint.length; r_foot++){
				for(let c_foot=0; c_foot<footprint[0].length; c_foot++){
					
					let gridsquare = obstacleGrid[r_try+r_foot][c_try+c_foot]; //shouldn't run into indexing problems b/c the footprint should be entirely in the obstacle grid
					
					//if footprint is 1, obstacleGrid needs to be 0 - shouldn't usually be needed for wall obstacles, but in case the user decides to make interesting footprints
					if(footprint[r_foot][c_foot] === 1 && gridsquare !== 0){ //obstacleGrid is global var
						continue attempt_loop;
					}
					
					//if footprint is 0, it doesn't matter what obstacleGrid is
					
					//if footprint is -1, obstacleGrid needs to be 0 or -1
					if(footprint[r_foot][c_foot] === -1 && gridsquare === 1){
						continue attempt_loop;
					}
				}
			}
			//if made it here without continuing attempt loop, we can place!
			console.log("Can place at: "+r_try+", "+c_try+"!");
			this.place(r_try,c_try); //defined in LargeObstacle or WallObstacle
			return true;
		}
		return false;
	}
}



function generateObstacles(n){ //n is number of obstacles to generate
	//if it's impossible to place n obstacles, we want the program to time out instead of trying infinitely to do it; set that up here
	let timed_out = false;
	setTimeout(function(){timed_out = true},500); //500 ms timeout
	
	//place the obstacles!
	let obstacles_placed = 0;
	while(!timed_out && obstacles_placed < n){
		//pick a random obstacle to place - obstacle_demographic and obstacle_types are global config vars
		let o_name = obstacle_demographic[ Math.floor(Math.random()*obstacle_demographic.length) ];
		let o_data = obstacle_types[o_name];
		
		console.log(o_name);
		
		//create and try to place obstacle
		let o = o_data.type==="large" ?
			new LargeObstacle(o_data.v_array, o_data.footprint) :
			new WallObstacle(o_data.v_array, o_data.footprint);
		
		if(o.tryToPlace()){
			obstacles.push(o);
			obstacles_placed++;
		}
		//otherwise do the loop again and keep trying
	}
}