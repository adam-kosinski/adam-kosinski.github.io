var selectGraphMenu = document.getElementById("selectGraph"); //drop-down menu
var graphInput = document.getElementById("graphInput");
var calculateButton = document.getElementById("calculate");
var output = document.getElementById("output");


calculateButton.addEventListener("click",calculate);
selectGraphMenu.addEventListener("change",selectGraph); //for selecting pre-loaded graphs
graphInput.addEventListener("input",resetMenu); //when something is written to the textarea, it may no longer be the preloaded graph, so reset the drop down menu


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


function selectGraph(){
	//get the graph
	let graphName = selectGraphMenu.value;
	if(graphName === "default"){return} //if the user selected the default option, don't do anything
	let M_adj = preloadedGraphs[graphName];
	
	console.log("Loaded "+graphName, M_adj);
	
	//format the graph as a string
	let stringMatrix = JSON.stringify(M_adj);
	stringMatrix = stringMatrix.replace(/\[\[/g, "[\n[");
	stringMatrix = stringMatrix.replace(/\],/g, "],\n");
	stringMatrix = stringMatrix.replace(/\]\]/g, "]\n]");
	
	//write the graph to the textarea
	graphInput.value = stringMatrix;
}


function resetMenu(){ //set the drop down menu for pre-loaded graphs (selectGraphMenu) to the default value
	selectGraphMenu.value = "default";
}