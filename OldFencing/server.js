// Dependencies
var express = require("express");
var http = require("http");
var path = require("path");
var socketIO = require("socket.io");

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

//variable to store players - each connection (socket) to the server has an id, that will be the key referencing the player in this object
var players = {};

//player objects have these properties:
//name: string
//health: number
//sword: object
	//contains:
	//x: number
	//y: number
	//theta: number (angle counterclockwise from vertical)


// Add the WebSocket handlers
io.on("connection", function(socket) {
	
	//when a new player joins, create a player object with the correct data
	socket.on("new player", function(data){
		players[socket.id] = {};
		for(prop in data){
			players[socket.id][prop] = data[prop];
		}
		console.log("New player, id: "+socket.id);
		console.log("Player data: "+JSON.stringify(players[socket.id]));
	});
	
	//remove player when they leave
	socket.on("disconnect", function(){
		delete players[socket.id];
	});
	
	//handle sword updates
	socket.on("sword_update", function(sword){
		if(!players[socket.id]){return} //don't do anything if the player isn't registered yet
		players[socket.id]["sword"] = sword;
	});
});


//run main game loop at 60 Hz

setInterval(function(){
	
	io.sockets.emit("player_state",players);
	
}, 1000 / 60);