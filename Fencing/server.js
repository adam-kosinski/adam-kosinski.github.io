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

// Add the WebSocket handlers
io.on("connection", function(socket) {
	socket.on("new player", function(){
		players[socket.id] = {};
		console.log("New player, id: "+socket.id);
	});
	
	//remove player when they leave
	socket.on("disconnect", function(){
		delete players[socket.id];
	});
});

