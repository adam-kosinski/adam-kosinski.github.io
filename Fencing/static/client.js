//SETUP--------------------------------------------------------------

//SERVER STUFF

let name = prompt("Please enter a name:");
if(!name || name===""){name = "unnamed";}

let socket = io();
let id; //id of the socket


//RENDERING STUFF

//set up scene, camera, and renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); //FOV, aspect ratio, near clipping plane distance, far clipping plane distance
let controls = new THREE.OrbitControls(camera); //requires the js file
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

	//renderer display canvas should always fill the window
window.addEventListener("resize", function(){
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});
//camera position is set in the player state update
camera.position.set(0,60,150);

document.body.appendChild(renderer.domElement);
renderer.domElement.style.cursor = "default"; //TODO: get rid of this eventually


//extra 3D stuff
//axes
let axes = new THREE.AxesHelper(12); //arg is size of axes. x-red, y-green, z-blue
scene.add(axes);

//helper arrows
let arrow_forearm = new THREE.ArrowHelper(new THREE.Vector3(1,0,0), new THREE.Vector3(0,33,140), 20);
scene.add(arrow_forearm);

//light
let aLight = new THREE.AmbientLight("white",1);
scene.add(aLight);

let dLight = new THREE.DirectionalLight("white",1);
dLight.position.set(1,4,1);
scene.add(dLight);



//array to organize each player's 3d objects. Player id key gives you a certain player's objects: {body: ___, sword: ___}
let player_objects = {};

//object to store all player's states
let player_data; //defined first time we receive player state from the server, several places check if this is defined to determine if they can proceed


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
	if(!players[id]){return;}

	//remove 3d objects of players that disconnected
	for(let player_id in player_objects){
		if( ! players.hasOwnProperty(player_id) ){
			//remove objects from scene
			scene.remove(player_objects[player_id].sword);
			//TODO: body object
			//remove player from storage arrays
			delete player_data[player_id];
			delete player_objects[player_id];
		}
	}

	//update our storage of player state
	player_data = players;

	//update camera - //TODO: not compatible with changing forward direction
//	camera.position.set(players[id].x + camera_offset.x, players[id].y + camera_offset.y, players[id].z + camera_offset.z);

	//camera.position.set(60, eye_height, 140);
	//camera.rotation.y = Math.PI/2;
	

	//update player 3d objects
	for(let player_id in players){
		//initialize objects for the player if haven't already
		if(!player_objects[player_id]){
			player_objects[player_id] = {
				//TODO: add body object
				sword: newSword()
			};
		}

		
		//update object position/rotation
			//aliases
		let cmd = players[player_id]; //what to set position/rotation to, coming from the server
		let obj = player_objects[player_id]; //3d objects to set position/rotation of
		
		//SWORD

		//position
		obj.sword.position.x = cmd.sword.x;
		obj.sword.position.y = cmd.sword.y;
		obj.sword.position.z = cmd.sword.z;

		//rotation

		//get vectors to rotate around (axes). Note: need to be normalized (unit vectors)
		let v_forearm = getForearmVector("put_forearm_obj_here"); //function in 3d_objects.js, TODO: make this actual forearm once I have one, right now defaults to pointing away from me
		let v_sword = getSwordVector(obj.sword); //vector from base pt to tip pt, function in 3d_objects.js

		let snap_axis = new THREE.Vector3();
		snap_axis.crossVectors(v_forearm, v_sword).normalize(); //sets snap_axis to cross product: forearm x sword
		let angle_axis = v_forearm.normalize();
		
		
		//do the rotation - d means delta
		let d_snap = cmd.d_snap;
		obj.sword.rotateOnWorldAxis(snap_axis, d_snap);
		let d_angle = cmd.d_angle;
		obj.sword.rotateOnWorldAxis(angle_axis, d_angle);
		
		//helpers		
		arrow_forearm.setDirection(v_forearm);
		
		//console.log("snap: " + v_forearm.angleTo(v_sword))
		//console.log("d_snap",d_snap,"oldang", player_data[player_id].sword.snap);

		//TODO: body


		//update display
		renderer.render(scene, camera);	

	} //end update if

});



//SENDING DATA TO SERVER--------------------------------------------------

function updateSword(data){ //data is an object with property/value of what to update. Options for properties: x,y,z,snap,twist,angle
	if(!player_data){return;} //don't do anything if haven't received this player state from the server yet

	//send update	
	socket.emit("sword_update", data);
}
