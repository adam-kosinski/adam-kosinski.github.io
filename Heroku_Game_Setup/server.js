//SERVER SETUP --------------------------------------------------------------------------------

// Dependencies
let express = require("express");
let http = require("http");
let path = require("path");
let socketIO = require("socket.io");

//app stuff
let app = express();
let server = http.Server(app);
let io = socketIO(server);

app.set("port", 5000);
app.use("/static", express.static(__dirname + "/static"));

// Routing
app.get("/", function(request, response) {
  response.sendFile(path.join(__dirname, "index.html"));
});

// Starts the server.
let port = process.env.PORT;
if(port == null || port == ""){
	port = 5000;
}
server.listen(port, function() {
  console.log("Starting server on port "+port);
});

//CLASSES ------------------------------------------------------
class PlayerStatus {
  constructor(name){
    this.name = name;
    this.connected = true; //because when we make one of these, it's triggered by a connected player
  }
}


//STORAGE ------------------------------------------------------

let player_statuses = {}; //holds PlayerStatus objects (used for connect/disconnect), keys are player names (not socket ids, since socket ids change when you disconnect then reconnect)
let id_to_name = {}; //maps socket ids to names. If a name isn't in here, player is disconnected

let game = undefined; //undefined means no game currently going on



// WEBSOCKET HANDLERS --------------------------------------------------------------------------------------------------------------------
io.on("connection", function(socket) {


  // PLAYER CONNECTIONS ----------------------------------------------


	socket.on("new player", function(name, callback){
    //return: "success" or "duplicate" or "spectator"

        console.log("received: new player")

        /* LOGIC:
        Check if player name exists in our register of player_statuses
          if not, make new player status (no return yet)
          if so, return "duplicate" if duplicate name (if player already connected)

          at this point the player status exists and we've filtered out duplicates - now need to decide if spectator or not

        if game going on and player not in the game, return "spectator"
        else (either no game going on, or player in the game), return "not spectator"
        */

        //check if this player exists
        if(!player_statuses.hasOwnProperty(name)){
          //make a player status for them
          console.log("New player status created for: " + name + " (id: " + socket.id + ")");
    			player_statuses[name] = new PlayerStatus(name);
    			id_to_name[socket.id] = name;
        }
        //if player exists, check if duplicate name
        else if(player_statuses[name].connected){
    			console.log(name + " is a duplicate name - asking them to try another");
    			callback("duplicate"); //duplicate name, tell the client it's invalid
          return; //stop right here, this doesn't count as a valid connection
    		}
        else {
          console.log(name + " reconnected (id: " + socket.id + ")");
        }

        //now the player has a player status and isn't a duplicate connection - we have a valid connection, update socket data
        id_to_name[socket.id] = name; //add the new mapping
        player_statuses[name].connected = true;


        //figure out if spectator or not and tell client
        if(game != undefined && !game.player_names.includes(name)) callback("spectator");
        else callback("not spectator");

        io.emit("player_connection", player_statuses);
	});

	//mark player as disconnected when they leave
	socket.on("disconnect", function(){
		if(id_to_name.hasOwnProperty(socket.id)){
			console.log(id_to_name[socket.id]+" disconnected (id: " + socket.id + ")");

			let player = player_statuses[id_to_name[socket.id]];
			player.connected = false;
			delete id_to_name[socket.id];

		}
		io.emit("player_connection", player_statuses);
	});

	socket.on("get_state", function(callback){
		callback(player_statuses, game); //if game is undefined, tells them no game currently happening
	});


});
