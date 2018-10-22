var graphInput = document.getElementById("graphInput");
var firstPlayerInput = document.getElementById("firstPlayerInput");
var calculateButton = document.getElementById("calculate");
var output = document.getElementById("output");


calculateButton.addEventListener("click",calculate);

function calculate(){
	//get inputs
	var M_adj = JSON.parse(graphInput.value);
	//var player = firstPlayerInput.value;
	
	//log interpretation to console
	console.log("Inputted Graph:");
	console.log(M_adj);
	//console.log("First Player:", player);
	
	//run function to determine m, and output result
	console.log("m",m(M_adj))
	output.innerText = "m = "+m(M_adj);
}