var graphInput = document.getElementById("graphInput");
var firstPlayerInput = document.getElementById("firstPlayerInput");
var calculateButton = document.getElementById("calculate");
var output = document.getElementById("output");


calculateButton.addEventListener("click",calculate);

function calculate(){
	//get inputs
	var M_adj = JSON.parse(graphInput.value);
	var player = firstPlayerInput.value;
	
	//log interpretation to console
	console.log("Inputted Graph:");
	console.log(M_adj);
	console.log("First Player:", player);
	
	//run function to see if they can guarantee a win in this position, and output result
	if(canPlayerForceWin(M_adj, player)) {
		output.innerText = "Player "+player+" can force a win from this position.";
	} else { 
		output.innerText = "Player "+player+" cannot force a win from this position.";
	}
}