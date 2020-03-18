// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");

//extra files
var config = require("server_config.js");
var THREE = require("three.js"); //including it on the server side b/c has useful functions for vector math. Can use it w/ exact syntax as in client file.

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static"));

// Routing
app.get("/", function(request, response) {
  response.sendFile(path.join(__dirname, "index.html"));
});

// Starts the server.
server.listen(5000, function() {
  console.log("Starting server on port 5000");
});

//variable to store players (see below class) - each connection (socket) to the server has an id, that will be the key referencing the player in this object
var players = {};

class PlayerPosition {
	constructor(){
		this.forward = new THREE.Vector3(0,0,-1); //direction player is facing (helpful for different player 1 facing opposite direction as player 2)
		this.x = 0; //always zero, we're not doing sideways motion
		this.y = 0; //pretty much always zero, unless the player jumps - not coding that
		this.z = 150;
		this.v_forearm = new THREE.Vector3(0,1,-1); //vector representing direction of forearm. Client can only access state, not methods
		this.arm = {
			//vector shoulder->hand specified by spherical coords:
			theta: 0, //horizotal rotation, 0 is straight forward, positive is to the right
			phi: (2/3)*Math.PI //vertical rotation, 0 is up, positive is downwards
		}
		this.sword = {
		  	x: 0,
			y: 33,
			z: 140,
		 	snap: new THREE.Vector3(0,1,0).angleTo(this.v_forearm), //angle between sword and forearm vectors. Sword is initially straight up
			twist: 0, //rotation along long axis of sword
			angle: 0, //left/right rotation of sword, 0 equal to straight up, positive is to the right. Rotation always around z-axis
		};
	}
}

class Player extends PlayerPosition {
	constructor(name){
		super(); //call parent constructor
		
		this.name = name;
		this.health = 100; //TODO: config var
		this.target = new PlayerPosition();
			
		//deltas for snap, twist, angle - used to command how much to rotate this frame
		this.d_snap = 0;
		this.d_twist = 0;
		this.d_angle = 0;
	}
}



// Add the WebSocket handlers
io.on("connection", function(socket) {
	
	//when a new player joins, create a player object with the correct data
	socket.on("new player", function(name){
		players[socket.id] = new Player(name);
		//set initial target values if not the same as initial position
		players[socket.id].target.sword.snap = config.max_sword_snap;

		console.log("New player: " + name + " (id: " + socket.id + ")");
		console.log("Player data:",players[socket.id]);
	});
	
	//remove player when they leave
	socket.on("disconnect", function(){
		if(players[socket.id]){
			console.log(players[socket.id].name + " disconnected (id: " + socket.id + ")");
			delete players[socket.id];
		}
	});
	
	//handle sword updates
	socket.on("sword_update", function(data){ //data is an object with property/value of what to update. Options for properties: x,y,z,snap,twist,angle
		if(!players[socket.id]){return} //don't do anything if the player isn't registered yet
		
		for(prop in data){ //update whatever properties are in 'data'
			players[socket.id].target.sword[prop] = data[prop];
		}
	});
});


//run main game loop at 60 fps (hz)

//function to get current time in sec
function t_now(){
	let time = process.hrtime(); //returns [sec, remaining nanosec];
	return time[0] + time[1]*10**-9;
}

let t_prev = t_now();

setInterval(function(){

	//update player state based on target position
	for(player_id in players){
		let p = players[player_id];	//alias


		//sanitize player's target positions - based on max position type stuff
		
		
		//limit stuff based on things like max velocity
		
		//sword position
		p.sword.x = p.target.sword.x;
		p.sword.y = p.target.sword.y;
		p.sword.z = p.target.sword.z;
		
		//sword angle - do this before sword snap b/c sword snap xy-plane-clipping is affected by sword's angle
		p.d_angle = p.target.sword.angle - p.sword.angle;
		p.sword.angle += p.d_angle;

		//sword snap - limit by speed of rotaion, by min snap, and sword can't pass plane parallel to xy plane that goes through the hand (so don't hit ourselves)
		//find max snap based on not passing plane
			//find normal to sword/forearm plane (snap axis)
	   	let v_sword = getSwordVector(p); //function defined below in this file
		let snap_axis = new THREE.Vector3().crossVectors(p.v_forearm, v_sword);
			//find normal to xy-parallel plane, facing away from player
		let n_plane = p.forward;
			//find vector of sword if it snapped such that it was on the xy-parallel plane - this vector is orthogonal to snap_axis and n_plane, so cross those
		let v_sword_on_plane = new THREE.Vector3().crossVectors(snap_axis, n_plane);
			//max snap is the snap of this vector
		let max_snap_from_clipping = v_sword_on_plane.angleTo(p.v_forearm);
		
		//limit delta snap
		let target_d_snap = Math.min(p.target.sword.snap, max_snap_from_clipping) - p.sword.snap; //gap we want to close
		let max_d_snap = (t_now() - t_prev) * config.sword_snap_speed; //speed restriction
		let min_d_snap = -max_d_snap;
		p.d_snap = Math.min( Math.max(target_d_snap, min_d_snap), max_d_snap); //clip target_d_snap between min and max
		p.sword.snap += p.d_snap;

		if(Math.abs(p.d_snap)>0.00001){console.log(p.d_snap);}
		//sword twist
		p.sword.twist = p.target.sword.twist;
		
	}
	
	io.sockets.emit("player_state", players);

	t_prev = t_now();
}, 1000/ 60);



//helper functions
function getSwordVector(p){ //p is the player object
	let snap_axis = new THREE.Vector3().crossVectors(p.v_forearm, new THREE.Vector3(0,1,0)).normalize();
	let angle_axis = p.v_forearm.normalize();

	//to get sword, start with forearm, rotate off of it to do snap, then around it to do angle
	let v_sword = new THREE.Vector3().copy(p.v_forearm);
	v_sword.applyAxisAngle(snap_axis, p.sword.snap); //snap
	v_sword.applyAxisAngle(angle_axis, p.sword.angle); //angle

	return v_sword;
}
