function pointInPolygon(p,poly){ //p of form [x,y], poly of form [[x1,y1],[x2,y2], ...], going around the polygon
	//NOTE: this function only works for convex polygons

	//method: test if point is on the same side of all polygon edges
	
	//line in standard form:
	// Ax + By + C = 0
	// get coefficients for the line containing one of the edges
	// -A/B = slope = (y2-y1)/(x2-x1), so:
	// A = -(y2 - y1)
	// B = x2 - x1
	// C = -(A*x1 + B*y1)    <-plug in any point on the line
	// plug in those coefficients with the x,y of the point
	// if result < 0, point is on right hand side of line; if result > 0, on left hand side
	
	
	let commonResult;
	
	for(var i=0; i<poly.length; i++){
		p1 = poly[i];
		p2 = poly[(i+1)%poly.length];
		
		let A = -(p2[1] - p1[1]);
		let B = p2[0] - p1[0];
		let C = -(A*p1[0] + B*p1[1]);
		
		let result = A*p[0] + B*p[1] + C;
		
		//convert result to 1 or -1
		if(result >= 0){result = 1}
		else {result = -1}
				
		if(!commonResult){
			commonResult = result;
		}
		else {
			if(result !== commonResult){return false}
		}
	}
	
	return true;
}

/*
//function to test how many times a line segment intersects a polygon
function numLineSegmentIntersections(seg, poly){ //seg of form [[x1,y1], [x2,y2]], poly of form [[x1,y1],[x2,y2], ...], going around the polygon
	//iterate through each edge in the polygon, and test if it intersects
}
*/


//this function and reorderVertices used to be useful for obstacle collision detection, but not so anymore

//function to determine if orientation of points p1->p2->p3 is counterclockwise, colinear, or clockwise
function orientation(p1,p2,p3){ //points of form [x,y]
	//rename for ease of reading
	let x1 = p1[0];
	let x2 = p2[0];
	let x3 = p3[0];
	let y1 = p1[1];
	let y2 = p2[1];
	let y3 = p3[1];
	
	let testResult = (y2 - y1)*(x3 - x2) - (y3 - y2)*(x2 - x1);
	if(testResult < -0.00001){return "counterclockwise"} //the decimals are for potential floating point error
	else if(testResult > 0.00001){return "clockwise"}
	else {return "colinear"}
}


//given a set of vertices of a polygon that go around the edge in one direction, leave them alone or flip them to get them to go around in the correct direction
function reorderVertices(vertices, direction){ //direction can be "counterclockwise" or "clockwise"
	if(vertices.length < 3){throw new Error("reorderVertices(): Need at least 3 vertices in a polygon")}
	
	//determine the current direction
	let currentDirection;
	for(let v=0; v<vertices.length && !currentDirection; v++){ //run until currentDirection is defined; may need multiple iterations if there are colinear vertices
		let orient = orientation(vertices[v], vertices[(v+1)%vertices.length], vertices[(v+2)%vertices.length]);
		if(orient === "counterclockwise" || orient === "clockwise"){
			currentDirection = orient;
		}
	}
	
	if(currentDirection !== direction){ //then flip it
		let newVertices = [];
		for(let v=vertices.length-1; v>=0; v--){
			newVertices.push(vertices[v]);
		}
		vertices = newVertices;
	}
	
	return vertices;
}




function lineIntersection(line1, line2){ //each line is represented by 2 different points on it: [[x1,y1], [x2,y2]]
	
	//returns point [x,y] if there's 1 intersection
	//returns infinity if the lines are the same
	//returns false if no intersection
	
	//use matrices to solve; start by converting lines into Ax + By = C
	//A and B go into a coefficient matrix and C goes into a constant matrix
	
	//M_coeff * [x,y] = M_const
	//fill values in the matrices 
	let M_coefficients = [];
	let M_constants = [];
	
	//-A/B = slope = (y2-y1)/(x2-x1), so:
	//   A = -(y2-y1)
	//   B = x2-x1
	//   C = A*x1 + B*y1   <- plug in any point on the line
	
	for(var i=0; i<2; i++){
		let line = i===0? line1 : line2;
		let A = -(line[1][1] - line[0][1]);
		let B = line[1][0] - line[0][0];
		let C = A*line[0][0] + B*line[0][1];
		
		M_coefficients.push([A,B]);
		M_constants.push([C]);
	}
	
	//check for parallel lines
	//check if both lines are vertical (B is zero)
	if(M_coefficients[0][1]===0 && M_coefficients[1][1]===0){
		//check if they're the same vertical line
		if( Math.abs(M_constants[0][0]/M_coefficients[0][0] - M_constants[1][0]/M_coefficients[1][0]) < 0.001 ){
			return Infinity;
		}
		else {
			return false;
		}
	}
	//if they're not both vertical, check if one of them is vertical -> not parallel
	else if(M_coefficients[0][1]===0 || M_coefficients[1][1]===0){} //let later code handle this
	//if neither is vertical, compute slopes for both (-A/B) and compare
	else {
		let slope1 = -M_coefficients[0][0]/M_coefficients[0][1];
		let slope2 = -M_coefficients[1][0]/M_coefficients[1][1];
		if( Math.abs(slope1-slope2) < 0.001 ){ //then parallel
			//compare y-intercepts (C/B) to tell if same line
			let b1 = M_constants[0][0]/M_coefficients[0][1];
			let b2 = M_constants[1][0]/M_coefficients[1][1];
			if( Math.abs(b1-b2) < 0.001 ){ //then same line
				return Infinity;
			}
			else {
				return false;
			}
		}
		//else, not parallel, let later code handle it
	}
	
	//evaluate solution
	//M_coeff * [x,y] = M_const, so
	//[x,y] = M_inv_coeff * M_const
	let M_inverse_coefficients = inverseMatrix(M_coefficients);
	if(!M_inverse_coefficients){
		//this should never happen b/c this means the test for parallel lines earlier failed
		throw new Error("Problem with testing parallel lines in lineIntersection()");
	}
	
	let solution =  multiplyMatrices(M_inverse_coefficients, M_constants);
	return [Number(solution[0][0].toFixed(2)), Number(solution[1][0].toFixed(2))];
}




//function to find intersection of 2 line segments. Returns intersection in form [x,y]. Returns false if they don't intersect, Infinity if infinite intersections
function lineSegmentIntersection(seg1, seg2){ //each line segment of format: [[x1,y1], [x2,y2]]
	//test if the segments share an endpoint; lineIntersection() will think infinite intersections b/c on same line, but actually 1 intersection
	if( (Math.abs(seg1[1][0]-seg2[0][0]) < 0.001) && (Math.abs(seg1[1][1]-seg2[0][1]) < 0.001) ){ //allow for floating point error
		return seg1[1];
	}
	if( (Math.abs(seg1[0][0]-seg2[1][0]) < 0.001) && (Math.abs(seg1[0][1]-seg2[1][1]) < 0.001) ){ //allow for floating point error
		return seg1[0];
	}
	
	//solve system of linear equations defined by the line segments
	let solution = lineIntersection(seg1, seg2);
	if(solution===false || solution===Infinity){return solution}
	
	//test if solution is on both line segments
	for(var i=0; i<2; i++){
		let seg = i===0? seg1 : seg2;
		
		if( ! onSegment(seg[0], solution, seg[1]) ){return false}
	}
	
	//intersection is on both segments; return [x,y] of intersection
	return solution;
}


//Given 3 colinear points p,q,r, function to test if point q is on line segment pr
function onSegment(p,q,r){ //all points of form [x,y]
	//test x coord - fix floating point error
	let minX = Number(Math.min(p[0], r[0]).toFixed(2));
	let maxX = Number(Math.max(p[0], r[0]).toFixed(2));
	let qx = Number(q[0].toFixed(2));
	if( ! (minX <= qx && qx <= maxX)) {return false}
	
	//test y coord - fix floating point error
	let minY = Number(Math.min(p[1], r[1]).toFixed(2));
	let maxY = Number(Math.max(p[1], r[1]).toFixed(2));
	let qy = Number(q[1].toFixed(2));
	if( ! (minY <= qy && qy <= maxY)) {return false}
	
	return true;
}



//function to find inverse of a 2x2 matrix only
//returns false if there's no inverse
function inverseMatrix(M){
	//check if not a 2x2 matrix
	if( ! (M.length===2 && M[0].length===2)){
		throw new Error("I (inverseMatrix()), don't know how to find the inverse of anything but a 2x2 matrix.");
	}
	
	//given M = [a,b]
	//			[c,d]
	//the inverse is:
	//1/det(M) * [ d,-b]
	//			 [-c, a]
	
	//get determinant = ad-bc
	let det = M[0][0]*M[1][1] - (M[0][1]*M[1][0]);
	if(det === 0){return false}
	let scalar = 1/det;
	
	//get inverse
	let inverse = 	[
					[Number((scalar *  M[1][1]).toFixed(10)), Number((scalar * -M[0][1]).toFixed(10))], //.toFixed() is for dealing w/ floating point error
					[Number((scalar * -M[1][0]).toFixed(10)), Number((scalar *  M[0][0]).toFixed(10))]
					];
	
	return inverse;
}



function multiplyMatrices(A,B){
	let product = [];
	
	//check if valid dimensions
	if(A[0].length !== B.length){
		debugger;
		throw new Error("Invalid dimensions for multiplying matrices");
	}
	
	//multiply
	//iterate through rows in A
	for(var i=0; i<A.length; i++){
		product.push([]);
		//iterate through columns in B
		for(var j=0; j<B[0].length; j++){
			let sum = 0;
			//iterate through entries in row of A / col of B
			for(var k=0; k<A[0].length; k++){
				sum += A[i][k]*B[k][j];
			}
			product[i][j] = Number(sum.toFixed(10)); //.toFixed() for dealing with floating point error
		}
	}
	
	return product;
}



//function to get the angle (-pi to pi) of a vector going from p1 to p2, measured with respect to straight right (standard angle position)
function getAngle(p1,p2){ //both points of form [x,y]
	let dist = Math.sqrt( (p2[0]-p1[0])**2 + (p2[1]-p1[1])**2 );
	let theta = Math.acos( (p2[0]-p1[0]) / dist );
	if(p2[1] - p1[1] < 0){theta *= -1}
	return theta;
}


//function to get angle diff between 2 thetas (-pi to pi); subtracts theta_2 - theta_1 (returns what you need to add to theta_1 to get theta_2)
//specifically, returns the difference with the smallest absolute value
function angleDiff(theta_1, theta_2){
	//convert angles to 0-2pi
	while(theta_1 < 0){theta_1 += 2*Math.PI}
	while(theta_2 < 0){theta_2 += 2*Math.PI}
	theta_1 %= (2*Math.PI);
	theta_2 %= (2*Math.PI);
	
	let diff_1 = theta_2 - theta_1;
	
	//add 2pi to the smaller angle
	if(theta_1 <= theta_2){theta_1 += 2*Math.PI}
	else {theta_2 += 2*Math.PI}
	
	let diff_2 = theta_2 - theta_1;
	
	//return the difference with the smallest absolute value
	if( Math.abs(diff_1) <= Math.abs(diff_2) ){return diff_1}
	else {return diff_2}
}