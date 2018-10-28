var graphInput = document.getElementById("graphInput");
var calculateButton = document.getElementById("calculate");
var output = document.getElementById("output");


calculateButton.addEventListener("click",calculate);

function calculate(){
	//get inputs
	var M_adj = JSON.parse(graphInput.value);
	
	//log interpretation to console
	console.log("Inputted Graph:");
	console.log(M_adj);
	
	output.innerText = "Calculating...";
	
	setTimeout(function(){ //timeout delays start of calculation (5ms), so that "Calculating..." can actually be displayed before calculation starts
		//run function to determine m, and output result
		output.innerText = "m = "+get_m(M_adj);
	},5);
}