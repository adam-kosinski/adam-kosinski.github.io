// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");

//extra files
var config = require("server_config.js");

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
		this.x = 0; //always zero, we're not doing sideways motion
		this.y = 0; //pretty much always zero, unless the player jumps - not coding that
		this.z = 150;
		this.sword = {
			position: {
		  		x: 0,
				y: 33,
				z: 140
		 	},
			rotation: {
		  		x: 0,
				y: 0,
				z: 0
		  	}
		}
	}
}

class Player extends PlayerPosition {
	constructor(name){
		super(); //call parent constructor
		
		this.name = name;
		this.health = 100; //TODO: config var
		this.target = new PlayerPosition();
	}
}



// Add the WebSocket handlers
io.on("connection", function(socket) {
	
	//when a new player joins, create a player object with the correct data
	socket.on("new player", function(name){
		players[socket.id] = new Player(name);
		console.log("New player, id: "+socket.id);
		console.log("Player data: "+JSON.stringify(players[socket.id]));
	});
	
	//remove player when they leave
	socket.on("disconnect", function(){
		console.log("id " + socket.id + " disconnected");
		delete players[socket.id];
	});
	
	//handle sword updates
	socket.on("sword_update", function(data){ //data is an object with property/value of what to update. Options for properties: x,y,z,x_rot,y_rot,z_rot
		if(!players[socket.id]){return} //don't do anything if the player isn't registered yet
		
		let p = players[socket.id];
		for(prop in data){ //update whatever properties are in 'data'
			switch(prop){
				case "x": p.target.sword.position.x = data[prop]; break;
				case "y": p.target.sword.position.y = data[prop]; break;
				case "z": p.target.sword.position.z = data[prop]; break;
				case "x_rot": p.target.sword.rotation.x = data[prop]; break;
				case "y_rot": p.target.sword.rotation.y = data[prop]; break;
				case "z_rot": p.target.sword.rotation.z = data[prop]; break;
			}
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

	//update player/sword's actual position based on target position
	for(player_id in players){
		let p = players[player_id];	


		//sanitize player's target positions - based on max position type stuff
		
		
		//limit stuff based on things like max velocity
		
		//sword position
		p.sword.position = p.target.sword.position; //no limiting right now

		//sword x_rot - limit by speed of rotaion
		let target_dx_rot = p.target.sword.rotation.x - p.sword.rotation.x;	
		let max_dx_rot = (t_now() - t_prev) * config.sword_x_rot_speed;
		let min_dx_rot = -max_dx_rot;
		p.sword.rotation.x += target_dx_rot < min_dx_rot ? min_dx_rot :
								target_dx_rot > max_dx_rot ? max_dx_rot :
									target_dx_rot;

		//sword y and z rot - no limit
		p.sword.rotation.y = p.target.sword.rotation.y;
		p.sword.rotation.z = p.target.sword.rotation.z;
	}
	
	io.sockets.emit("player_state", players);

	t_prev = t_now();
}, 1000/ 60);
