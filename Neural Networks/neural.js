function makeArray(len,len2=0){
	var array = [];
	for(var r=0; r<len; r++){
		var row = 0; //default value of 0 is important in NeuralNetwork.execute
		if(len2){
			row = [];
			for(var c=0; c<len2; c++){
				row.push(0);
			}
		}
		array.push(row);
	}
	return array;
}


function NeuralNetwork(nInNodes, nHidLay1Nodes, nHidLay2Nodes, nOutNodes){
		//node value storage
	this.inputNodes = makeArray(nInNodes);
	this.hidLay1Nodes = makeArray(nHidLay1Nodes);
	this.hidLay2Nodes = makeArray(nHidLay2Nodes);
	this.outputNodes = makeArray(nOutNodes);
	
		//synapse grids
	this.sGrids = [	makeArray(nInNodes, nHidLay1Nodes),
					makeArray(nHidLay1Nodes, nHidLay2Nodes),
					makeArray(nHidLay2Nodes, nOutNodes)];
	
		//method to generate random synapse grids
	this.fillSGridsRandomly = function(){
		//iterate through sGrids
		for(var sGrid=0; sGrid<3; sGrid++){
			//iterate through input array
			for(var i=0, iL=this.sGrids[sGrid].length; i<iL; i++){
				//iterate through output array
				for(var o=0, oL=this.sGrids[sGrid][i].length; o<oL; o++){
					//fill values
					this.sGrids[sGrid][i][o] = Math.random()*2 - 1;
				}
			}
		}
	}
	
		//method to execute neural network (input -> output)
	this.execute = function(input){
		if((typeof input !== "object") || (input.length !== this.inputNodes.length)){
			return "Flappy Penguins are unhappy penguins because you didn't input an array of the right length.";
		}
		
		//define function taking a synapse grid and input and output arrays as arguments, and puts values in output array
		var miniExecute = function(sGrid, input, output){
			//reset output values to 0
			output = makeArray(output.length);
			
			//set new values
			for(var i=0, iL=input.length; i<iL; i++){
				for(var o=0, oL=output.length; o<oL; o++){
					output[o] += input[i] * sGrid[i][o];
				}
			}
			
			return output;
		}
		
		//fill input nodes
		this.inputNodes = input;
		
		//fill hidden Layer 1
		this.hidLay1Nodes = miniExecute(this.sGrids[0], this.inputNodes, this.hidLay1Nodes);
		
		//fill hidden Layer 2
		this.hidLay2Nodes = miniExecute(this.sGrids[1], this.hidLay1Nodes, this.hidLay2Nodes);
		
		//fill output
		this.outputNodes = miniExecute(this.sGrids[2], this.hidLay2Nodes, this.outputNodes);
		
		//return output
		return this.outputNodes;
	}
}

var myNeuralNetwork = new NeuralNetwork(2,3,4,5);

console.log(myNeuralNetwork);