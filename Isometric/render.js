function transformPoint(p) //get canvas x and y of 3-space point a, returns a Point object (x,y,0);
{
	//get vector from viewplane origin to the point
	let v = new Vector(viewplane_origin, p);
	
	//project that vector onto viewplane
	let v_proj = v.projectOntoPlane(viewplane);

	//project that onto x and y drawing directions (on viewplane), get canvas x and y coords from signed magnitude of that vector
	let x = px_per_unit * v_proj.dot(x_draw_dir)/x_draw_dir.mag;
	let y = px_per_unit * v_proj.dot(y_draw_dir)/y_draw_dir.mag;
	
	return new Point(x,y);
}
/*
function drawLine(a,b) //line from 3-space points A to B
{
	//draw the line on the canvas, accounting for y flipping
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(a.x,-a.y);
	ctx.lineTo(b.x,-b.y);
	ctx.stroke();
}*/


function drawPolygon(polygon)
{
	let p = []; //get array of vertices
	//transform points from 3-space to canvas
	for(let i=0; i<polygon.v.length; i++)
	{
		p[i] = transformPoint(polygon.v[i]);
	}
	//draw the polygon
	ctx.fillStyle = polygon.color;
	ctx.beginPath();
	ctx.moveTo(p[0].x, -p[0].y);
	for(let i=1; i<p.length; i++){
		ctx.lineTo(p[i].x, -p[i].y);
	}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function pointInPolygon(p,poly){
	//process input, since this was copied from tanks
	polygon = [];
	for(let i=0; i<poly.v.length; i++){
		polygon.push([poly.v[i].x,poly.v[i].y]);
	}
	poly = polygon;
		
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
	
	//store the result for each edge, must be the same for the point to be in the polygon
	let commonResult;
	
	//iterate through vertices
	for(var i=0; i<poly.length; i++){
		p1 = poly[i];
		p2 = poly[(i+1)%poly.length];
		
		let A = -(p2[1] - p1[1]);
		let B = p2[0] - p1[0];
		let C = -(A*p1[0] + B*p1[1]);
		
		let result = A*p.x + B*p.y + C;
		
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


//need a different sorting algorithm where saying order of 2 things doesn't matter with respect to each other doesn't mean they are equal
//used for getRenderOrder()
function sort(array,f){
	//method:
	//fill a matrix called comparisons with results of f
	//find the item(s) that needs to be sorted lower than anything else: f(that,other) is always (-) or 0, put it/them into the sorted array,
	//and remove it/them from the input array.
	//if no such item (means f(that,other) is (+) for at least one 'other', for all 'thats'),
	//the sort won't work, throw an error - this is a limitation of my rendering method
	
	//shallow copy array
	array = array.slice();
	
	//sorted output array
	let out = [];
	

	let n = array.length;
	
	//compare all elements together
	let comparisons = [];
	for(let i=0; i<n; i++){
		let row = [];
		for(let j=0; j<n; j++){
			row.push(0);
		}
		comparisons.push(row);
	}
	for(let a=0; a<n-1; a++){
		for(let b=a+1; b<n; b++){
			let result = f(array[a],array[b]);
			comparisons[a][b] = result;
			comparisons[b][a] = -result;
		}
	}
	
	//find lowest item(s)
	
	//flag to help determine if impossible sort
	let found_one = false;
		
	while(n>0){
		found_one = false;
		
		consider:
		for(let a=0; a<n; a++){ //considering these items
			for(let b=0; b<n; b++){ //comparing to these items
				if(a===b){continue}
				if(comparisons[a][b] > 0){ //then not the lowest one
					continue consider;
				}
			}
			//if made it here, it's a lowest one
			n--;
			out.push(array[a]);
				//remove from comparisons and array
			array.splice(a,1);
			comparisons.splice(a,1);
			for(let i=0; i<n; i++){
				comparisons[i].splice(a,1);
			}
			
			found_one = true;
			
			break consider;
		}
	
		//if we looked at all the items and didn't find one, sorting is impossible - throw error
		if(!found_one){
			throw new Error("Impossible sort");
		}
	}
	
	return out;
}

//function to get order to render CONVEX polygons that don't intersect in 3-space
//note: problem...if you have a rock-paper-scissors situation where all things are on top of something and below something, this won't work - sort() will throw an error
function getRenderOrder(polygons)
{
	// Method:
	// 1. project each polygon onto viewplane
	// 2. iterate through pixels on canvas, checking if a pixel/point is in both polygons
	// 		-if so, do a depth test at that point
	// 3. use average of depth tests to sort (not every depth test will be correct - edges of polygon)
	
	return sort(polygons, function(poly1,poly2)
	{	
		//console.log(poly1.color,poly2.color,performance.now());
		//project poly1 and poly2
		let polys = [poly1,poly2];
		let proj_polys = [];
		for(let i=0; i<2; i++)
		{
			let poly = polys[i];
			let proj_points = [];
			for(let n=0; n<poly.v.length; n++)
			{
				proj_points.push(transformPoint(poly.v[n]));
			}
			proj_polys.push(new Polygon(poly.color,proj_points));
		}
		let proj_poly1 = proj_polys[0];
		let proj_poly2 = proj_polys[1];
		
		
		//iterate through possible pixels of intersection
		//get bounds
		let x_min = Infinity;
		let x_max = -Infinity;
		let y_min = Infinity;
		let y_max = -Infinity;
		for(let v=0; v<proj_poly1.v.length; v++) {
			let x = proj_poly1.v[v].x;
			let y = proj_poly1.v[v].y;
			if(x < x_min){x_min = x}
			if(x > x_max){x_max = x}
			if(y < y_min){y_min = y}
			if(y > y_max){y_max = y}
		}
		for(let v=0; v<proj_poly2.v.length; v++) {
			let x = proj_poly2.v[v].x;
			let y = proj_poly2.v[v].y;
			if(x < x_min){x_min = x}
			if(x > x_max){x_max = x}
			if(y < y_min){y_min = y}
			if(y > y_max){y_max = y}
		}
				
		//iterate
		
		let poly1_depths = [];
		let poly2_depths = [];
		
		for(let x=x_min; x<x_max; x++){
			for(let y=y_min; y<y_max; y++){
				let p = new Point(x,y);
				//test if point is in both projected polygons
				if( pointInPolygon(p, proj_poly1) && pointInPolygon(p, proj_poly2) ) {					
					
					poly1_depths.push( getPointDepth(p, poly1) );
					poly2_depths.push( getPointDepth(p, poly2) );
				}
			}
		}
		
		if(poly1_depths.length === 0 && poly2_depths.length === 0) {return 0} //no overlap, doesn't matter what order
		else {
			//get average depth of shared pixels for each polygon
			let avg_depth1 = poly1_depths.reduce(function(a,b){return a+b}) / poly1_depths.length;
			let avg_depth2 = poly2_depths.reduce(function(a,b){return a+b}) / poly2_depths.length;
						
			//returning a negative value means draw poly1 before poly2, a positive value means draw poly1 after poly2
			//we want to draw the bigger depth first
			return avg_depth2 - avg_depth1;
		}
		
	});
	
	//return sorted array - draw polygons earlier in array first = farthest back
	//return polygons;
}



function renderCube(x,y,z,size) //x,y,z are coords of vertex of cube with most negative coords
{
	let p = []; //stores vertices
	
	//get all vertices
	for(let k=0; k<2; k++){
		for(let i=0; i<2; i++){
			for(let j=0; j<2; j++){
				p.push(new Point(x+size*i, y+size*j, z+size*k));
			}
		}
	}
	
	//get polygons
	
	polygons = [];
	polygons.push(new Polygon("red",[p[0], p[1], p[3], p[2]])); //bottom square
	polygons.push(new Polygon("orange",[p[4], p[5], p[7], p[6]])); //top square
	polygons.push(new Polygon("yellow",[p[0], p[1], p[5], p[4]])); //back left square
	polygons.push(new Polygon("green",[p[0], p[2], p[6], p[4]])); //back right square
	polygons.push(new Polygon("blue",[p[1], p[3], p[7], p[5]])); //front left square
	polygons.push(new Polygon("black",[p[2], p[3], p[7], p[6]])); //front right square
	/*
	//draw polygons
	console.log(polygons);
		//get render order
	let renderOrder = getRenderOrder(polygons);
	console.log(renderOrder);
	
		//iterate through and draw
	for(let n=0; n<polygons.length; n++)
	{
		drawPolygon(polygons[n]);
	}
	
	*/
}