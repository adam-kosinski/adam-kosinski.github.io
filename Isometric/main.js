//x axis: down and to the left
//y axis: down and to the right
//z axis: up

//DOM references
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
//translate origin location on canvas
ctx.translate(250,250);

//make an offscreen canvas that will be used for testing in the rasterization algorithm
let test_canvas = document.createElement("canvas");
test_canvas.width = canvas.width;
test_canvas.height = canvas.height;
let test_ctx = test_canvas.getContext("2d");
test_ctx.translate(250,250);


//directions of the axes
let x_dir = new Vector(1,0,0);
let y_dir = new Vector(0,1,0);
let z_dir = new Vector(0,0,1);

//viewer location
let viewpoint = new Point(-0.5,1,0.5); //note: since we are doing isometric view, only the direction of this point from the origin matters

//center location (what we look at, what we rotate around)
let centerpoint = new Point(0,0,0);

//plane of projection
let viewplane;

//DRAWING STUFF
//directions of the x and y drawing axes in 3 space
//will project vectors on viewplane onto these and get x and y coords from those vector magnitudes
let x_draw_dir;
let y_draw_dir;

//origin location on viewplane
let viewplane_origin = centerpoint;

//scalar for canvas
let px_per_unit = 50; //how many pixels on the canvas corresponds to one unit in 3-space


updateViewpoint(viewpoint); //will define viewplane, all proj_dir. See below for func definition
generateCubePolygons(0,0,0,1);
render(ctx,polygons);

//animate rotation
let time = 0; //in seconds
let t = 0;
let fps = 50;
let id;
function animate(){
	id = setInterval(function(){
		ctx.clearRect(-canvas.width,-canvas.height,2*canvas.width,2*canvas.height);
		
		let newViewpoint = new Point(Math.cos(time),Math.sin(time),0.5*Math.sin(time+Math.PI/4));
		updateViewpoint(newViewpoint);
		
		render(ctx,polygons);
		
		console.log(performance.now()-t);
		t=performance.now();
		
		time += 1/fps;
	}, 1000/fps);
}
function stop(){clearInterval(id)}
//function declarations -----------------------------------

function updateViewpoint(newViewpoint)
{
	viewpoint = newViewpoint;
	
	let normal = new Vector(centerpoint, viewpoint); //vector normal to plane we're projecting onto
	viewplane = new Plane(normal, centerpoint);
	
	//get gradient of viewplane
	let grad = new Vector(-viewplane.normal.i/viewplane.normal.k, -viewplane.normal.j/viewplane.normal.k);
	
	//project gradient onto viewplane
	let grad_proj = grad.projectOntoPlane(viewplane);
	//y_draw_dir will be the unit vector in this directions
	y_draw_dir = grad_proj.unit();
	
	//get vector perpendicular to grad_proj, rotated 90 deg clockwise with respect to viewer
	//cross: grad_proj x vector_from_centerpoint_to_viewer
	//x_draw_dir will be the unit vector of this cross product
	x_draw_dir = grad_proj.cross(viewplane.normal).unit();
}


canvas.addEventListener("click", function(e){
	console.log(e.layerX-250,e.layerY-250);
});