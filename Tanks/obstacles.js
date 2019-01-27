//obstacles are polygons - must be convex (for the collision function to work). Construct concave obstacles out of multiple convex ones
function Obstacle(...vertices){ //must be at least 3 vertices, going around the polygon, of form [x,y]
	//this notation means 'vertices' will be an array containing all the arguments
	
	if(vertices.length < 3){
		throw new Error("Obstacle objects must have at least 3 vertices");
	}
	
	this.vertices = vertices;
	this.color = obstacleColor; //global config value
	
	//determine center of obstacle by averaging vertices
	this.center = [0,0];
	for(let v=0; v<this.vertices.length; v++){
		this.center[0] += this.vertices[v][0];
		this.center[1] += this.vertices[v][1];
	}
	this.center[0] /= this.vertices.length;
	this.center[1] /= this.vertices.length;
	
	//methods
	this.detectLineCollision = function(seg,circleRadius=undefined){
		//seg is a line segment representing the path of the object that might collide, of form [[x1,y1], [x2,y2]]
		//circleRadius is optional, used for detecting collisions of circular objects (bullets) with their center traveling along seg; collision point returned still refers to the center of the object
		//returns false if no collision, or an object representing the collision: {theta_normal:0-2pi, point:[x,y]} //theta of the vector normal to the surface of collision
		
		let collisions = []; //put collision objects here
		
		//loop through edges and see if they intersect with seg
		for(let e=0; e<this.vertices.length; e++){
			//get the 2 points making up the edge
			let p1 = this.vertices[e];
			let p2 = this.vertices[(e+1)%this.vertices.length];
			
			
			//determine direction of normal vector from collided edge (points to the side of the edge the object came from)
			//note: doing this now instead of after confirmed collision b/c of the possibility of testing circular object collision
			
				//get the direction opposite to the movement of the object colliding with the obstacle edge
			let theta_antimovement = getAngle(seg[1], seg[0]); //getAngle() in tests.js
			
				//get direction of the edge of the obstacle
			let theta_edge = getAngle(p1, p2);
			
				//get possible directions for the normal (perpendicular to edge of obstacle)
			let theta_normal_1 = (theta_edge + Math.PI/2) % (2*Math.PI);
			let theta_normal_2 = (theta_edge + 3*Math.PI/2) % (2*Math.PI);
							
				//figure out which direction for the normal is closer to theta_antimovement, that's the correct one
			let theta_normal;
			if( Math.abs(angleDiff(theta_normal_1, theta_antimovement)) < Math.abs(angleDiff(theta_normal_2, theta_antimovement)) ) { //angleDiff() defined in tests.js
				theta_normal = theta_normal_1;
			} else {
				theta_normal = theta_normal_2;
			}
			
			//modify seg if testing circular object collision
			let x_offset = 0;
			let y_offset = 0;
			if(circleRadius){
				x_offset = circleRadius*Math.cos(theta_normal+Math.PI);
				y_offset = circleRadius*Math.sin(theta_normal+Math.PI);
				
				seg[0][0] += x_offset;
				seg[1][0] += x_offset;
				seg[0][1] += y_offset;
				seg[1][1] += y_offset;
			}
			
			
			let intersection = lineSegmentIntersection(seg, [p1,p2]); //lineSegmentIntersection() defined in tests.js
			if(circleRadius){ //if doing circular object collision, reset seg to original
				seg[0][0] -= x_offset;
				seg[1][0] -= x_offset;
				seg[0][1] -= y_offset;
				seg[1][1] -= y_offset;
			}
			
			if(intersection !== false && intersection !== Infinity){ //if just one intersection point
				//if we're doing circular object detection, fix the coordinate to be the center of the circular object
				if(circleRadius){
					intersection[0] -= x_offset;
					intersection[1] -= y_offset;
				}
				
				collisions.push({theta_normal:theta_normal, point:intersection});
			}
		}
		//if multple collisions, use the first one
		if(collisions.length > 1){
			//calculate distance from collision to starting point of each collision, and take the one with min distance
			let best;
			let minDist = Infinity;
			for(let c=0; c<collisions.length; c++){
				let newDist = Math.sqrt( (collisions[c].point[0]-seg[0][0])**2 + (collisions[c].point[1]-seg[0][1])**2 );
				if(newDist < minDist){
					best = collisions[c];
					minDist = newDist;
				}
			}
			
			collisions = [best];
		}
		
		if(collisions.length > 0){
			return collisions[0];
		}
		else {
			return false;
		}
	}
	
	//function for detecting if objects moving on a circular arc collide with this obstacle
	this.detectArcCollision = function(x,y,radius,theta_start,theta_end,counterclockwise=true){ //counterclockwise determined by math, not visual
		//if there's a collision, returns the theta of the collision (on the circle defined by the given x,y,radius)
		//returns false if no collision
		
		let collisions = []; //put theta of collision(s) here
		
		//loop through edges and see if they intersect with seg
		for(let e=0; e<this.vertices.length; e++){
			//get the 2 points making up the edge
			let p1 = this.vertices[e];
			let p2 = this.vertices[(e+1)%this.vertices.length];
			
			//get point on obstacle edge that's min distance from circle center, and that min distance
				//get 2 lines then do lineIntersection(); get another point on the line containing the circle center and the desired point
			let otherPoint = [x -(p2[1]-p1[1]), y +(p2[0]-p1[0]) ];
			let min_dist_point = lineIntersection([p1,p2], [[x,y], otherPoint]);
			if(min_dist_point===false || min_dist_point===Infinity){ //the other possible return values besides a point
				throw new Error("Something went wrong when finding min_dist_point in Obstacle.detectArcCollision()");
			}
			let dist_to_edge = Math.sqrt( (x-min_dist_point[0])**2 + (y-min_dist_point[1])**2 );
			
			//if the min distance from the circle center to the edge is greater than the radius, no intersection
			if(dist_to_edge > radius){continue} //check next edge
			
			//full circle is guaranteed to intersect line that the obstacle edge is on once or twice
			//get distance along the obstacle edge's line from min_dist_point to the intersection points (if only 1 intersection point, this distance will be 0)
			//pythag theorem
			let offset_dist = Math.sqrt( radius**2 - dist_to_edge**2 );
			
			//get points of intersection
				//get angle from p1 to p2 so we know which way to go with distance offset_dist
			let theta_edge = getAngle(p1,p2);
				//get points and put angles into collisions array
			let pointsChecked = 0;
			do {
				pointsChecked++;
				theta_edge += Math.PI; //flip this direction every time we try to find a point (needs to be at beginning of loop so continue statements trigger it)
				
				let collisionPoint = [min_dist_point[0] + offset_dist*Math.cos(theta_edge),  min_dist_point[1] + offset_dist*Math.sin(theta_edge)];
				let theta_collision = getAngle([x,y], collisionPoint); //getAngle() in tests.js
								
				//verify point is on the obstacle edge, not just on that line
				if( ! onSegment(p1, collisionPoint, p2) ){continue} //onSegment() in tests.js
								
				//verify point is on the arc traveled by the object, not just on the full circle
					//convert all relevant thetas to 0-2pi
				while(theta_collision < 0){theta_collision += 2*Math.PI}
				while(theta_start < 0){theta_start += 2*Math.PI}
				while(theta_end < 0){theta_end += 2*Math.PI}
				theta_collision %= (2*Math.PI);
				theta_start %= (2*Math.PI);
				theta_end %= (2*Math.PI);
					//convert theta_collision and theta_end to greater than theta_start
				while(theta_collision <= theta_start){theta_collision += 2*Math.PI}
				while(theta_end <= theta_start){theta_end += 2*Math.PI}
					//fix floating point error on all angles
				theta_collision_rounded = Number(theta_collision.toFixed(2));
				theta_start = Number(theta_start.toFixed(2));
				theta_end = Number(theta_end.toFixed(2));
					//check
				if ( ! (
					(counterclockwise && theta_start <= theta_collision_rounded && theta_collision_rounded <= theta_end) ||
					(!counterclockwise && theta_collision_rounded >= theta_end) 
					) )
				{
					continue;
				}
				
				collisions.push(theta_collision);
			} while (pointsChecked<2 && offset_dist>0);
		}
		
		//if multiple collisions, use the first one
		if(collisions.length > 1){
			//calculate angle from collision to starting point of each collision, and take the one with min angle
			let best;
			let minAngle = Infinity;
			for(let c=0; c<collisions.length; c++){
				let newAngle = counterclockwise ? angleDiff(theta_start, collisions[c]) : angleDiff(collisions[c], theta_start);
				if(newAngle < 0){newAngle += 2*Math.PI}
				
				if(newAngle < minAngle){
					best = collisions[c];
					minAngle = newAngle;
				}
			}
			
			collisions = [best];
		}
		
		if(collisions.length > 0){
			return collisions[0];
		}
		else {
			return false;
		}
	}
	
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
			//format of overlap object: {axis: [?,?], overlap: ?}
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
		
			//figure out which direction for the normal is closer to center-of-obstacle -> center-of-shape, that's the correct one
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
			ctx.lineTo(vertices[v][0], vertices[v][1]);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
}