//SETUP--------------------------------------------------------------

var socket = io();
var id; //id of the socket

//CONNECTION TO SERVER--------------------------------------------------

//send a new player message to the server
socket.emit("new player",{"name":name});

//store the id of the connection
socket.on("connect", function(){
	console.log("My ID: "+socket.id);
	id = socket.id;
});



//RECEIVING SERVER DATA-------------------------------------------------

socket.on("player_state", function(players){ //players is an object containing all the player data
	//don't do anything if this player isn't registered with the server yet
	if(!players[id]){return}
	
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	drawExtra();
	
	//draw other player's sword
	for(p_id in players){
		ctx.fillStyle = "red";
		let p = players[p_id];
		if(p.sword){
			drawSword(p.sword.x, p.sword.y, p.sword.theta);
		}
	}
	
	//draw my sword
	ctx.fillStyle = "black";
	let me = players[id];
	if(me.sword){
		drawSword(me.sword.x, me.sword.y, me.sword.theta);
	}
});



//SENDING DATA TO SERVER--------------------------------------------------

function updateSword(x,y,theta){
	socket.emit("sword_update",{"x":x, "y":y, "theta":theta});
}