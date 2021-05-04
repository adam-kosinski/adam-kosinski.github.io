//SETUP ---------------------------------------------------

let socket = io();
let id; //id of the socket
let my_name;
let am_spectator;

//CONNECTION TO SERVER -----------------------------------

//send a new player message to the server, and pick name
function registerName(){
	my_name = prompt("Please enter a name (if reconnecting must match previous name):"); //TODO: make this a GUI thing not a prompt

		//filter out no name or canceling the popup
		if(my_name===""){
			registerName(); //empty strings don't work, try again
			return;
		}
		if(!my_name){
			socket.disconnect();
			throw new Error("Name entry canceled, disconnecting client and leaving webpage blank");
		}

		//check name
		socket.emit("new player", my_name, function(name_info_string){
			console.log("Name registration, server returned:", name_info_string);

			if(name_info_string == "duplicate"){
				//invalid connection, try again
				alert("'"+my_name+"' is taken. Please choose another");
				my_name = undefined;
				registerName();
				return;
			}

			//we have a valid connection

			document.getElementById("load_screen").style.display = "none"; //get rid of black div covering the page

			if(name_info_string == "spectator"){
				alert("You are viewing an ongoing game as a spectator.");
				am_spectator = true;
			}
			else {
				am_spectator = false;
			}
		});
}

registerName();


//store the id of the connection
socket.on("connect", function(){
	console.log("My ID: "+socket.id);
	id = socket.id;
});


//check if a game is going on
socket.emit("get_state", function(player_statuses, game){
	if(game){
		console.log("game already started");
		//initialize game display
	}
	else {
		document.getElementById("home_screen");.style.display = "block";
	}
});





//debug -----------------------------------------------
function getState(){
	socket.emit("get_state", function(player_statuses, game){
		console.log("Player Statuses", player_statuses);
		console.log("Game", game);
	});
}





// SOCKET EVENT HANDLERS ---------------------------------

socket.on("player_connection", function(player_statuses){
	//update player display on home screen
	let player_display = document.getElementById("player_display");
	player_display.innerHTML = "";
	for(let name in player_statuses){
		if(player_statuses[name].connected){
			let div = document.createElement("div");
			div.id = name + "_home_screen";
			div.textContent = name;
			player_display.appendChild(div);
		}
	}

	//indicate disconnected in game GUI if game active TODO
});
