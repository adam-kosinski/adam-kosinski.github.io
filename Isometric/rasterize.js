// UTILITY FUNCTIONS ----------------------------------------------------------------------------------

function transformPoint(p) //input: Point object in 3 space, returns projected Point object in 2-space (x,y,0) on the viewplane
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


function drawPolygon(ctx,polygon) //input a Polygon object to draw
{
	let v = []; //get array of vertices
	//transform points from 3-space to canvas
	for(let i=0; i<polygon.v.length; i++)
	{
		v[i] = transformPoint(polygon.v[i]);
	}
	//draw the polygon
	ctx.fillStyle = polygon.color;
	ctx.beginPath();
	ctx.moveTo(v[0].x, -v[0].y);
	for(let i=1; i<v.length; i++){
		ctx.lineTo(v[i].x, -v[i].y);
	}
	ctx.closePath();
	ctx.fill();
	//ctx.stroke();
}

//function to get signed depth of a point to a polygon in 3 space, positive depth is away from viewpoint
function getPointDepth(p, polygon) //p is 2d point on viewplane/canvas, polygon is a polygon in 3 space
{
	/* The math for isometric:

	line orthogonal to viewplane, through p on the viewplane

	get unit vector v = <a,b,c> normal to viewplane pointing away from viewer, p0 = (x0,y0,z0) is 3d point p on viewplane

	x = at + x0
	y = bt + y0
	z = ct + z0

	plane of polygon, <i,j,k> is a normal vector to the polygon, (x1, y1, z1) is any old point on the polygon's plane
	i(x-x1) + j(y-y1) + k(z-z1) = 0

	Solve for the t that gives the intersection point:
	
	aliases
	dx = x0 - x1
	dy = y0 - y1
	dz = z0 - z1

	sub in x,y,z of line to plane
	i(at + x0 - x1) + j(bt + y0 - y1) + k(ct + z0 - z1) = 0
	
	//distribute
	iat + idx + jbt +jdy + kct + kdz = 0
	
	//rearrange and factor
	t(ia + jb + kc) = -(idx + jdy + kdz)
	t = i(x1-x0) + j(y1-y0) + k(z1-z0) / ia + jb + kc
	t = <i,j,k> * <p0 to p1> / <i,j,k> * <a,b,c>
	t = (poly.normal * <p0 to p1>) / (poly.normal * v)
	
	this is an interesting conclusion from the previous line but probably not helpful:
	t = mag of proj <p0 to p1> onto poly.normal / mag of proj v onto poly.normal

	t will be the signed distance from (x0,y0,z0) to the point of intersection on the polygon because v was a unit vector

	*/
	
	let v = (new Vector(viewpoint, viewplane_origin)).unit();
	//convert p to 3 space and call that p0
		//vector from viewplane_origin to p
	p.x /= px_per_unit;
	p.y /= px_per_unit;
	let offset_vector = x_draw_dir.scale(p.x).add(y_draw_dir.scale(p.y));
	let p0 = viewplane_origin.addVector(offset_vector);
	
	//get a point on the polygon
	let p1 = polygon.v[0];
	
	//get vector p0 to p1
	let p0_p1 = new Vector(p0,p1);
	
	//get normal vector of polygon
	let n = polygon.normal;
	
	//calculate t
	let t = n.dot(p0_p1) / n.dot(v);
	
	return t;
}


/* -----------------------------------------------------------------------------------------------------

RASTERIZATION ALGORITHM:

storage needed:
	polygons (must lie on a plane, if not will need to separate before passing to this function)
	pixels object; property = pixel index (number), value = {color:String, opacity:Number, depth:Number, x:Number, y:Number} - x and y are 2d viewplane coords
		-note about pixel index: pixels in the canvas each have an index, left to right then top to bottom (idx*4 gives index in imageData)

1. loop through all polygons
	a) figure out what pixels are in each triangle - use alpha channel of a same-size off-screen canvas to do this
		-get depth of pixel
			-closer to player = smaller depth, depth=0 on viewplane (can have negative depth)
		-if that pixel isn't in the pixels object, add it
		-if the pixel is in the pixels object, keep the one with the smallest distance
			-record the pixel and its color
2. loop through the pixels object and draw everything 1 pixel at a time
*/


function render(draw_ctx,polygons) //polygons is an array of Polygon objects that each lie on a plane
{
	/*ctx.clearRect(-canvas.width,-canvas.height,2*canvas.width,2*canvas.height);
	let renderOrder = getRenderOrder(polygons);
	console.log(renderOrder);
	for(let i=0; i<renderOrder.length; i++){
		drawPolygon(draw_ctx,renderOrder[i]);
	}*/
	
	//pixel storage
	let pixels = {};
	
	//reference to original canvas
	let draw_canvas = draw_ctx.canvas;
	
	//reference canvas that will be used to extract pixels from each polygon
	let canvas = test_canvas;
	let ctx = test_ctx;
	ctx.imageSmoothingEnabled = false;
		
	//loop through polygons
	for(let i=0, n_polygons=polygons.length; i<n_polygons; i++){
		//draw polygon
		ctx.clearRect(-canvas.width,-canvas.height,2*canvas.width,2*canvas.height);
		drawPolygon(ctx, polygons[i]);
		
		//use image data to get affected pixels
		let data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
		//iterate through pixels to figure out which ones are in this polygon
		for(let p=0, n_p=data.length/4; p<n_p; p++){
			//check alpha channel to see if this pixel is in the polygon
			if(data[4*p + 3] > 0){
				//get pixel color
				let r = data[4*p];
				let g = data[4*p + 1];
				let b = data[4*p + 2];
				let a = data[4*p + 3];
				let color = "rgb("+r+","+g+","+b+")";
				let opacity = a/255;
				
				//get pixel depth - signed distance from point on viewplane/canvas to polygon along a line following the projection
					//2d coords
/*magic numbers*/				let x = p % canvas.width - 250;
				let y = 250 - Math.floor(p / canvas.width);
				let depth = getPointDepth(new Point(x,y), polygons[i]);
				
				//if(x === 21 && y === 42){debugger;}
				
				//if pixel isn't already in the pixels object, or this has the smallest depth (which would overwrite the previous pixel), put this pixel in the pixels object
				if(!pixels[p] || depth < pixels[p].depth){
					pixels[p] = {
						color: color,
						opacity: opacity,
						depth: depth,
						x: x,
						y: y
					}
				}
				
			} //end pixel must be in polygon check
		} //end pixel iteration
	} //end polygon interation
		
	//draw pixels!
	for(px in pixels){
		draw_ctx.fillStyle = pixels[px].color;
		draw_ctx.globalAlpha = pixels[px].opacity;
		draw_ctx.fillRect(pixels[px].x, -pixels[px].y, 1, 1);
	}
	
}