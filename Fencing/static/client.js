//SETUP--------------------------------------------------------------

//SERVER STUFF

let name = prompt("Please enter a name:");
if(!name || name===""){name = "unnamed"}

let socket = io();
let id; //id of the socket


//RENDERING STUFF

//set up scene, camera, and renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); //FOV, aspect ratio, near clipping plane distance, far clipping plane distance
//let controls = new THREE.OrbitControls(camera); //requires the js file
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

	//renderer display canvas should always fill the window
window.addEventListener("resize", function(){
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});

document.body.appendChild(renderer.domElement);
renderer.domElement.style.cursor = "default"; //TODO: get rid of this eventually

camera.position.set(0, eye_height, 150 + camera_offset_from_head.z);


//array to organize each player's 3d objects. Player id key gives you a certain player's objects: {body: ___, sword: ___}
let player_objects = {};

//object to store this player's state
let me; //defined upon first player state emit from server


//extra 3D stuff
//axes
let axes = new THREE.AxesHelper(12); //arg is size of axes. x-red, y-green, z-blue
scene.add(axes);

//light
let aLight = new THREE.AmbientLight("white",1);
scene.add(aLight);

let dLight = new THREE.DirectionalLight("white",1);
dLight.position.set(1,4,1)
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

	//update this player's state
	me = players[id];

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
		let cmd = players[player_id]; //what to set position/rotation to, coming from the server
		let obj = player_objects[player_id]; //what to set
		
			//sword
		obj.sword.position.x = cmd.sword.position.x;
		obj.sword.position.y = cmd.sword.position.y;
		obj.sword.position.z = cmd.sword.position.z;
		obj.sword.rotation.x = cmd.sword.rotation.x;
		obj.sword.rotation.y = cmd.sword.rotation.y;
		obj.sword.rotation.z = cmd.sword.rotation.z;

			//TODO: body
	}

	//remove 3d objects of players that disconnected
	for(player_id in player_objects){
		if( ! players.hasOwnProperty(player_id) ){
			//remove objects from scene
			scene.remove(player_objects[player_id].sword);
			//TODO: body object
			//remove objects from storage array
			delete player_objects[player_id];
		}
	}

	//update display
	renderer.render(scene, camera);	
});



//SENDING DATA TO SERVER--------------------------------------------------

function updateSword(data){ //data is an object with property/value of what to update. Options for properties: x,y,z,x_rot,y_rot,z_rot
	if(!me){return;} //don't do anything if haven't received this player's state from the server yet

	//send update	
	socket.emit("sword_update", data);
}
