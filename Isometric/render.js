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

function pointInPolygon(point,poly){
	//process input, since this was copied from tanks
	p = [point.x,point.y];
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

//function to get order to render CONVEX polygons that don't intersect in 3-space
function getRenderOrder(...polygons)
{
	// Method:
	// 1. project each polygon onto viewplane
	// 2. if one vertex of a polygon is in another polygon, do a depth test at that vertex to determine which to sort to be drawn later
	//		(drawn later = closer to viewer)
	
	polygons.sort(function(poly1,poly2)
	{	
		//project poly1 and poly2
		let polys = [poly1,poly2];
		let proj_polygons = [];
		for(let i=0; i<2; i++)
		{
			let poly = polys[i];
			let proj_points = [];
			for(let n=0; n<poly.v.length; n++)
			{
				proj_points.push(transformPoint(poly.v[n]));
			}
			proj_polygons.push(new Polygon(poly.color,proj_points));
		}
		let proj_poly1 = proj_polygons[0];
		let proj_poly2 = proj_polygons[1];
		
		//iterate through vertices of proj_poly1
		for(let n=0; n<proj_poly1.v.length; n++){
			let p = proj_poly1.v[n];
			//check if vertex is in proj_poly2
			console.log(p,proj_poly2);
			if(pointInPolygon(p,proj_poly2))
			{
				//do depth test (0 = at viewplane, + = away from viewpoint, - = towards viewpoint direction)
					//same as distance from vertex to viewplane
				let dist_poly1 = new Vector(viewplane_origin,poly1.v[n]).dot(viewplane.normal)/viewplane.normal.mag; //viewplane.normal comes towards viewer 
				
					//see below this function for the math derivation
				let num = poly2.normal.dot(new Vector(poly1.v[n], poly2.v[0]));
				let denom = poly2.normal.dot(viewplane.normal);
				let t = num/denom;
				let x = viewplane.normal.i*t + poly1.v[n].x;
				let y = viewplane.normal.j*t + poly1.v[n].y;
				let z = viewplane.normal.k*t + poly1.v[n].z;
				let intersect = new Point(x,y,z);
				let dist_poly2 = new Vector(viewplane_origin,intersect).dot(viewplane.normal)/viewplane.normal.mag;
				
				if(dist_poly1 < dist_poly2){return 1} //sort poly1 after poly2, to be drawn on top
				else if(dist_poly1 > dist_poly2){return -1} //sort poly1 before poly2, to be drawn behind
				else {return 0} //order doesn't matter
			}
			//else, keep iterating
		}
		
		//iterate through vertices of proj_poly2
		for(let n=0; n<proj_poly2.v.length; n++){
			let p = proj_poly2.v[n];
			//check if vertex is in proj_poly1
			if(pointInPolygon(p,proj_poly1))
			{
				console.log("Boo");
				//do depth test (0 = at viewplane, + = away from viewpoint, - = towards viewpoint direction)
					//same as distance from vertex to viewplane
				let dist_poly2 = new Vector(viewplane_origin,poly2.v[n]).dot(viewplane.normal)/viewplane.normal.mag; //viewplane.normal comes towards viewer 
				
					//see below this function for the math derivation
				let num = poly1.normal.dot(new Vector(poly2.v[n], poly1.v[0]));
				let denom = poly1.normal.dot(viewplane.normal);
				let t = num/denom;
				let x = viewplane.normal.i*t + poly2.v[n].x;
				let y = viewplane.normal.j*t + poly2.v[n].y;
				let z = viewplane.normal.k*t + poly2.v[n].z;
				let intersect = new Point(x,y,z);
				let dist_poly1 = new Vector(viewplane_origin,intersect).dot(viewplane.normal)/viewplane.normal.mag;
				
				console.log("dist "+poly1.color+": "+dist_poly1);
				console.log("dist "+poly2.color+": "+dist_poly2);
				
				if(dist_poly2 < dist_poly1){return 1} //sort poly2 after poly1, to be drawn on top
				else if(dist_poly2 > dist_poly1){return -1} //sort poly2 before poly1, to be drawn behind
				else {return 0} //order doesn't matter
			}
			//else, keep iterating
		}
		
		return 0; //if polygons don't intersect on the canvas, doesn't matter what order to draw them in
	});
	
	//return sorted array - draw polygons earlier in array first = farthest back
	return polygons;
}

/*distance logic for above function:

line orthogonal to viewplane, through vertex of one polygon

get unit vector <a,b,c> pointing away from viewer, (x0,y0,z0) is point on viewplane

x = at + x0
y = bt + y0
z = ct + z0

plane of polygon
i(x-x1) + j(y-y1) + k(z-z1) = 0

Solve for the t that gives the intersection point:

dx = x0 - x1
dy = y0 - y1
dz = z0 - z1

i(at + x0 - x1) + j(bt + y0 - y1) + k(ct + z0 - z1) = 0

iat + idx + jbt +jdy + kct + kdz = 0

t(ia + jb + kc) = -(idx + jdy + kdz)
t = i(x1-x0) + j(y1-y0) + k(z1-z0) / ia + jb + kc
t = <i,j,k> * <p0 to p1> / <i,j,k> * <a,b,c>

t will be the signed distance from (x0,y0,z0) to the point

*/


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
	polygons.push(new Polygon("red",[p[4], p[5], p[7], p[6]])); //top square
	polygons.push(new Polygon("red",[p[0], p[1], p[5], p[4]])); //back left square
	polygons.push(new Polygon("red",[p[0], p[2], p[6], p[4]])); //back right square
	polygons.push(new Polygon("red",[p[1], p[3], p[7], p[5]])); //front left square
	polygons.push(new Polygon("red",[p[2], p[3], p[7], p[6]])); //front right square
	/*
	//draw polygons
	console.log(polygons);
		//get render order
	let renderOrder = getRenderOrder.apply(this,polygons);
	console.log(renderOrder);
	
		//iterate through and draw
	for(let n=0; n<polygons.length; n++)
	{
		drawPolygon(polygons[n]);
	}
	
	*/
	
	
	//draw lines
	
	/*/vertical lines
	drawLine(p[0], p[4]);
	drawLine(p[1], p[5]);
	drawLine(p[2], p[6]);
	drawLine(p[3], p[7]);
	
	//bottom square
	drawLine(p[0], p[1]);
	drawLine(p[0], p[2]);
	drawLine(p[1], p[3]);
	drawLine(p[2], p[3]);
	
	
	
	//top square
	drawLine(p[4], p[5]);
	drawLine(p[4], p[6]);
	drawLine(p[5], p[7]);
	drawLine(p[6], p[7]);*/
}