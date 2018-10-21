//game-defining variables
var nOfStartingNodes = 2;




//define object constructors

function Node(edges){
	this.edges = edges;
}

function Region(nodes){ //nodes in an array of Node objects
	this.nodes = nodes;
}

function Graph(regions){ //regions is an array of Region objects
	this.regions = regions;
}


//create storage variables
var nodes = [];
var regions = [];
var graph;


//initialize starting position
for(var i=0; i<nOfStartingNodes; i++){ //create starting nodes
	nodes.push(new Node(0));
}
	//add all nodes to the initial region
regions.push(new Region(nodes.slice())); //shallow copy will preserve references to Node objects

	//add region to the graph
graph = new Graph(regions.slice())); //shallow copy will preserve references to Region objects







//function to iterate through a region and draw lines wherever possible
function drawLinesInRegion(region,graph){
	nodes = deepCopy(region).nodes;
	console.log("nodes",nodes);
	//iterate through possibilities for first node
	for(var a=0; a<nodes.length; a++){
		var firstNode = nodes[a];
		if(firstNode.edges === 3){continue} //don't use nodes that are already fulfilled
		console.log("firstNode",firstNode)
		
		//iterate through possibilites for second node
		for(var b=a; b<nodes.length; b++){ //starting b at a ensures no duplicates
			var secondNode = nodes[b];
			if(secondNode.edges === 3 || (secondNode===firstNode && secondNode.edges >=2)){continue} //don't use nodes that are fulfilled, and don't overfulfill a node
			console.log("secondNode",secondNode);
			
			drawLine(region,a,b);
		}
	}
}

function drawLine(graph,region,firstNodeIndex,secondNodeIndex){
	var graph = deepCopy(graph);
	var region = deepCopy(region);
	var nodes = region.nodes;
	
}





function deepCopy(object){
	var copy;
	//figure out if input is an array or a generic object
	if(Array.isArray(object)){copy = []}
	else {copy = {}}
	
	for(prop in object){
		if(typeof object[prop] === "object"){
			copy[prop] = deepCopy(object[prop]);
		} else {
			copy[prop] = object[prop]
		}
	}
	return copy;
}