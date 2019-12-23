let renderWidth = 500;
let renderHeight = 500;

//we need 3 things - a scene, a camera, and a renderer (which comes with a canvas element)
//the renderer takes in the scene and camera and renders it on each frame update

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, renderWidth/renderHeight, 0.1, 1000); //FOV, aspect ratio, near clipping plane, far clipping plane
let controls = new THREE.OrbitControls(camera);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(renderWidth, renderHeight);

//add renderer to the DOM so we can see it
document.body.appendChild(renderer.domElement);


//now make a cube
//need some geometry, a material, and a mesh to put the two together
/*let geometry = new THREE.BoxGeometry(1,2,1);
let material = new THREE.MeshStandardMaterial({color:"blue"});
let cube = new THREE.Mesh(geometry2, material);
scene.add(cube);*/


//now make the sword
let sword_length = 3.5;

let sword = new THREE.Group();

//sword blade
let g_blade = new THREE.CylinderGeometry(0.02, 0.05, (6/7)*sword_length); //g = geometry
let m_blade = new THREE.MeshStandardMaterial({color:"gray"}); //m = material
let blade = new THREE.Mesh(g_blade, m_blade);
blade.position.y = (3/7)*sword_length + (1/14)*sword_length; //half of blade + halfway down handle (rotation point)
sword.add(blade);

//sword "hilt" (guard+hilt)
let hilt = new THREE.Group();

let g_guard = new THREE.SphereGeometry(0.25,16,4,0,2*Math.PI,0,Math.PI/2);
let m_guard = new THREE.MeshStandardMaterial({color:"dimgray", side:THREE.DoubleSide});
let guard = new THREE.Mesh(g_guard, m_guard);
hilt.add(guard);

let g_handle = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
let handle = new THREE.Mesh(g_handle, m_guard);
hilt.add(handle);

sword.add(hilt);

scene.add(sword);

//axes
let axes = new THREE.AxesHelper(1); //arg is size of axes. x-red, y-green, z-blue
scene.add(axes);


//light
let aLight = new THREE.AmbientLight("white",1);
scene.add(aLight);

let dLight = new THREE.DirectionalLight("white",1);
dLight.position.set(2,0,2)
scene.add(dLight);


//move the camera so we can see the sword
camera.position.set(0,0,5);
camera.rotation.x = 0;


sword.position.set(0,2,0);

//we need a render loop in order to see anything
function animate(){
	
	sword.rotation.z += 0.01;
		
	//render
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
