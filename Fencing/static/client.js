//SETUP--------------------------------------------------------------

//SERVER STUFF

let name = prompt("Please enter a name:");
if(!name || name===""){name = "unnamed"}

var socket = io();
var id; //id of the socket


//RENDERING STUFF

//set up scene, camera, and renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, renderWidth/renderHeight, 0.1, 1000); //FOV, aspect ratio, near clipping plane distance, far clipping plane distance
let controls = new THREE.OrbitControls(camera); //requires the js file
let renderer = new THREE.WebGLRenderer();
renderer.setSize(renderWidth, renderHeight);
document.body.appendChild(renderer.domElement);


camera.position.set(0,0,100);


//array to organize each player's 3d objects. Player id key gives you a certain player's objects: {body: ___, sword: ___}
let player_objects = {};



//extra 3D stuff
//axes
let axes = new THREE.AxesHelper(12); //arg is size of axes. x-red, y-green, z-blue
scene.add(axes);

//light
let aLight = new THREE.AmbientLight("white",1);
scene.add(aLight);

let dLight = new THREE.DirectionalLight("white",1);
dLight.position.set(2,0,2)
scene.add(dLight);


//CONNECTION TO SERVER--------------------------------------------------

//send a new player message to the server
socket.emit("new player", name);

//store the id of the connection
socket.on("connect", function(){
	console.log("My ID: "+socket.id);
	id = socket.id;
});


//RECEIVING SERVER DATA-------------------------------------------------

socket.on("player_state", function(players){ //players is an object containing all the player data (object of player-id keys, storing Player objects - see server.js for class def)
	//don't do anything if this player isn't registered with the server yet
	if(!players[id]){return}

	//update player 3d objects
	for(player_id in players){
		//initialize objects for the player if haven't already
		if(!player_objects[player_id]){
			player_objects[player_id] = {
				//TODO: add body object
				sword: newSword("dimgrey")
			}
		}

		//update object position/rotation
		let p_srv = players[player_id]; //what to set position/rotation to, coming from the server
		let p_obj = player_objects[player_id]; //what to set
		console.log("p_srv",p_srv);
		p_obj.sword.position.x = p_srv.sword.position.x;
		p_obj.sword.position.y = p_srv.sword.position.y;
		p_obj.sword.position.z = p_srv.sword.position.z;
		p_obj.sword.rotation.x = p_srv.sword.rotation.x;
		p_obj.sword.rotation.y = p_srv.sword.rotation.y;
		p_obj.sword.rotation.z = p_srv.sword.rotation.z;
	}

	//update display
	renderer.render(scene, camera);	
});



//SENDING DATA TO SERVER--------------------------------------------------

function updateSword(x,y,z,theta){
	socket.emit("sword_update", {"x":x, "y":y, "z":z, "theta":theta});
}
