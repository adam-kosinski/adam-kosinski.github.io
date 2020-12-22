//SETUP ---------------------------------------------------

let socket = io();
let id; //id of the socket

//CONNECTION TO SERVER -----------------------------------

//send a new player message to the server, and pick name
function registerName(){
	//my_name declared in globals.js
	my_name = prompt("Please enter a name (< 11 characters or display problems happen):"); //TODO: make this a GUI thing not a prompt
	if(my_name===""){
		registerName();
		return;
	}
	if(!my_name){
		throw new Error("Name entry canceled, leaving webpage blank");
	}

	socket.emit("new player", my_name, function(success){
		console.log("Name registration success:",success);
		if(!success){
			alert("'"+my_name+"' is taken. Please choose another");
			my_name = undefined;
			registerName();
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
		game_active = true;
		console.log("game already started");
		//initialize game display
	}
	else {
		//home_screen.style.display = "block";
	}
});



// FUNCTIONS SENDING STUFF TO SERVER ---------------------------

function updateServerElement(element, ...style_properties){
	//sends data about an element (tagname, id, className, style) to the server, who remembers the data for each element it's tracking
	//if the server notices a difference, it will send out updates to all the clients but this one, do change the element's display
	//if the element is not yet tracked, the server will start tracking it

	//only the style properties specified as extra arguments will be updated

	let data = {
		tagName: element.tagName.toLowerCase(),
		id: element.id,
		className: element.className,
		style: {}
	};

	let style = getComputedStyle(element);
	for(let i=0; i<style_properties.length; i++){
		let prop = style_properties[i];
		data.style[prop] = style[prop];
	}

	socket.emit("update_server_element", data);
}




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


socket.on("start_game", function(){
	game_active = true;
	console.log("Game starting");
});


socket.on("update_client_element", function(data){
	console.log("update_client_element", data);
	updateClientElement(data);
});
