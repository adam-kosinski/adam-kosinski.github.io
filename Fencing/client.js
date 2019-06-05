var socket = io();
var id; //id of the socket

//CONNECTION TO SERVER

//send a new player message to the server
socket.emit("new player");

//store the id of the connection
socket.on("connect",function(){
	console.log("My ID: "+socket.id);
});