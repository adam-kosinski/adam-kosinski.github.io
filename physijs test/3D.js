Physijs.scripts.worker = '/libraries/physijs_worker.js';
Physijs.scripts.ammo = '/libraries/ammo.js';



let renderWidth = window.innerWidth;
let renderHeight = window.innerHeight;

//we need 3 things - a scene, a camera, and a renderer (which comes with a canvas element)
//the renderer takes in the scene and camera and renders it on each frame update

let scene = new Physijs.Scene();
let camera = new THREE.PerspectiveCamera(75, renderWidth/renderHeight, 0.1, 1000); //FOV, aspect ratio, near clipping plane, far clipping plane
let controls = new THREE.OrbitControls(camera);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(renderWidth, renderHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//add renderer to the DOM so we can see it
document.body.appendChild(renderer.domElement);


//make the floor
let g_floor = new THREE.BoxGeometry(50,0.5,50);
let m_floor = Physijs.createMaterial(
	new THREE.MeshStandardMaterial({color: "white"}),
	0.8, //friction
	0.5 //bounciness
);
let floor = new Physijs.BoxMesh(g_floor, m_floor, 0); //0 mass
floor.position.y = -0.25;
floor.receiveShadow = true;
scene.add(floor);


/*/now make a cube
//need some geometry, a material, and a mesh to put the two together
let geometry = new THREE.BoxGeometry(2,0.5,2);
let material = Physijs.createMaterial(
	new THREE.MeshStandardMaterial({color:"blue"}),
	0.8,
	1.0
);
let cube = new Physijs.BoxMesh(geometry, material);
cube.position.y = 3;
scene.add(cube);*/


function newSword(x,y,z,rx=0,ry=0,rz=0){

	let sword_length = 3.5;

	//sword handle
	let g_handle = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
	let m_handle = new THREE.MeshStandardMaterial({color:"dimgray", side:THREE.DoubleSide});
	let handle = new Physijs.CylinderMesh(g_handle, m_handle);
	handle.castShadow = true;

	let sword = handle; //clarity of reading

	let g_guard = new THREE.SphereGeometry(0.25,16,4,0,2*Math.PI,0,Math.PI/2);
	let m_guard = m_handle;
	let guard = new Physijs.SphereMesh(g_guard, m_guard);
	guard.castShadow = true;
	sword.add(guard);

	//sword blade
	let g_blade = new THREE.CylinderGeometry(0.02, 0.05, (6/7)*sword_length); //g = geometry
	let m_blade = new THREE.MeshStandardMaterial({color:"gray"}); //m = material
	let blade = new Physijs.ConeMesh(g_blade, m_blade);
	blade.position.y = (3/7)*sword_length + (1/14)*sword_length; //half of blade + halfway down handle (rotation point)
	blade.castShadow = true;
	sword.add(blade);

	sword.position.set(x,y,z);
	sword.rotation.set(rx,ry,rz);
	scene.add(sword);
	return sword;
}

newSword(0,3,0,0,0,1);
newSword(-1,4,2,-1.5,0,0);


//axes
let axes = new THREE.AxesHelper(1); //arg is size of axes. x-red, y-green, z-blue
scene.add(axes);


//light
let aLight = new THREE.AmbientLight("white",1);
scene.add(aLight);

let dLight = new THREE.DirectionalLight("white",1);
dLight.position.set(0,50,50);
dLight.castShadow = true;
scene.add(dLight);


//move the camera so we can see the sword
camera.position.set(0,5,10);
camera.rotation.x = 0;



//we need a render loop in order to see anything
function render(){
	scene.simulate();
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

window.addEventListener("load",function(){
	requestAnimationFrame(render);
});
