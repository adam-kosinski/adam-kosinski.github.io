function addPart(l,w,h,color){
	if(GUI_Editable === false){return}
	
	//get dimensions if not already provided
	if(!l || !w || !h){
		l = Number(prompt("Overall Part Length(Depth) = ?"));
		w = Number(prompt("Overall Part Width = ?"));
		h = Number(prompt("Overall Part Height = ?"));
	}
	//check if valid dimensions entered
	if( !(0<l && l<=puzzleL && l%1===0) ||
		!(0<w && w<=puzzleW && w%1===0) ||
		!(0<h && h<=puzzleH && h%1===0) ){
			
		alert("Invalid Dimensions Entered.");
		return;
	}
	
	//get color if not already provided
	if(!color){
		color = prompt("Part Color = ?\n\nOptions:\nred, orange, yellow, lightgreen, darkgreen, lightblue, darkblue, purple, pink, brown, gray");
		if(color === null){return} //if clicked cancel button
		else{color = color.toLowerCase()}
	}
	
	//store this command
	inputCommandStorage += "addPart("+l+","+w+","+h+",'"+color+"');\n";
	
	//convert color name to hex
	switch(color){
		case "red": color = "#ff0000"; break;
		case "orange": color = "#ffa500"; break;
		case "yellow": color = "#ffff00"; break;
		case "lightgreen": color = "#00ff00"; break;
		case "darkgreen": color = "#008000"; break;
		case "lightblue": color = "#87ceeb"; break;
		case "darkblue": color = "#0000cd"; break;
		case "purple": color = "#800080"; break;
		case "pink": color = "#ff69b4"; break;
		case "brown": color = "#8b4513"; break;
		case "gray": color = "#808080"; break;
		default: color = "#808080";
	}
	
	//create data storage for the part
	var partData = [];
	var partInfo = {
		color:color,
		nOfCubes:0
	};
	
	var partNum = nOfParts; //first part created will be part 0, second one part 1, etc.
	
	//create container element
	var partElement = document.createElement("div");
	partElement.className = "part";
	partElement.style.backgroundColor = color + "44"; //4th pair of characters in hex is the alpha channel; '44' is roughly equivalent to 25%
	partElement.id = "part"+partNum;
	
	//create label with part number
	var labelElement = document.createElement("p");
	labelElement.className = "partLabel";
	labelElement.innerText = partNum;
	partElement.appendChild(labelElement);
	
	//iterate through tiers, rows, cols ('tier' means layer)
	for(var tier=0; tier<h; tier++){
		
		var tierData = [];
		
		var tierElement = document.createElement("table");
		tierElement.className = "tier";
		var tbody = document.createElement("tbody");
		
		for(var r=0; r<l; r++){
			
			var rowData = [];
			
			var rowElement = document.createElement("tr");
			
			for(var c=0; c<w; c++){
				
				var cellElement = document.createElement("td");
					//add event listener to allow inputting cubes
				(function(partElement,tier,r,c){ //need to assign event listener inside a separate scope so inputs are independent of what happens to those variables - except for first one, b/c of the remove function
					cellElement.addEventListener("click",function(){
						var thisPartNum = Number(partElement.firstElementChild.innerText);
						toggleCell(thisPartNum,tier,r,c);
					});
				})(partElement,tier,r,c);
				
				rowData.push(0);
				rowElement.appendChild(cellElement);
			}
			tierData.push(rowData);
			tbody.appendChild(rowElement);
		}
		partData.push(tierData);
		
		tierElement.appendChild(tbody);
		partElement.appendChild(tierElement);
	}
	
	parts.push(partData);
	partsInfo.push(partInfo);
	
	//add removability
	var remover = document.createElement("a");
	remover.className = "remover";
	remover.href = "javascript:undefined"; //no redirect happens
	remover.innerText = "Remove";
	remover.addEventListener("click",function(){
		var thisPartNum = Number(partElement.firstElementChild.innerText);
		removePart(thisPartNum);
	});
	partElement.appendChild(remover);
	
	document.getElementById("partsContainer").appendChild(partElement);
	
	nOfParts++;
}

function toggleCell(partNum,tier,r,c){ //all inputs are numbers
	if(GUI_Editable === false){return}
	
	//store this command
	inputCommandStorage += "toggleCell("+partNum+","+tier+","+r+","+c+");\n";
	
	console.log("part "+partNum,"tier "+tier,"row "+r,"col "+c);
	
	//get html reference to cell
	var partElement = document.getElementById("part"+partNum);
	var tierElement = partElement.children[tier+1]; //have to account for label being first child
	var rowElement = tierElement.firstElementChild.children[r];
	var cellElement = rowElement.children[c];
	
	//toggle: data, display, and nOfCubesEntered
	if(parts[partNum][tier][r][c] === 0){
		parts[partNum][tier][r][c] = 1; //part data
		partsInfo[partNum].nOfCubes++; //part info
		cellElement.style.backgroundColor = partsInfo[partNum].color; //display
		nOfCubesEntered++;
	} 
	else if(parts[partNum][tier][r][c] === 1){
		parts[partNum][tier][r][c] = 0;
		partsInfo[partNum].nOfCubes--;
		cellElement.style.backgroundColor = "initial";
		nOfCubesEntered--;
	}
}

function removePart(partNum){
	if(!GUI_Editable){return}
	if(!confirm("Are you sure you want to remove this part?")){return}
	
	//store this command
	inputCommandStorage += "removePart("+partNum+");\n";
	
	var nOfCubes = partsInfo[partNum].nOfCubes; //store this so I can subtract it from nOfCubesEntered at the end of this function
	
	//remove part from GUI and from data
	var partElement = document.getElementById("part"+partNum);
	partElement.parentNode.removeChild(partElement);
	
	parts.splice(partNum,1);
	partsInfo.splice(partNum,1);
	
	//get parts and rename them
	var partElements = document.getElementsByClassName("part");
	for(var i=0; i<partElements.length; i++){
		partElements[i].id = "part"+i;
		partElements[i].firstElementChild.innerText = String(i); //part label
	}
	
	nOfCubesEntered -= nOfCubes;
	nOfParts--;
}






function addSolution(solutionNum){
	var solution = solutions[solutionNum];
	
	var h = solution.length;
	var l = solution[0].length;
	var w = solution[0][0].length;
	
	//create container element
	var container = document.createElement("div");
	container.className = "solution";
	container.id = "solution"+solutionNum;
	
	//create label with solution number
	var labelElement = document.createElement("p");
	labelElement.className = "partLabel";
	labelElement.innerText = "Solution "+solutionNum;
	container.appendChild(labelElement);
	
	//create layer display container
	var tierContainer = document.createElement("div");
	tierContainer.className = "tierContainer";
	
	//iterate through tiers, rows, cols ('tier' means layer)
	for(var tier=0; tier<h; tier++){
		
		var tierElement = document.createElement("table");
			tierElement.className = "tier"; //for styling purposes
		var tbody = document.createElement("tbody");
		
		for(var r=0; r<l; r++){
			
			var rowElement = document.createElement("tr");
			
			for(var c=0; c<w; c++){
				
				var cellElement = document.createElement("td");
				var partNum = Number(solution[tier][r][c].slice(1)); //omit the first character (will be 'p' indicating 'part') by slicing
				cellElement.style.backgroundColor = partsInfo[partNum].color;
				cellElement.innerText = partNum;
				
				rowElement.appendChild(cellElement);
			}
			tbody.appendChild(rowElement);
		}
		
		tierElement.appendChild(tbody);
		tierContainer.appendChild(tierElement);
		container.appendChild(tierContainer);
	}
	
	//do isometric stuff here -----------------------------------------------
	//add isometric display container
	var isoContainer = document.createElement("div");
	isoContainer.className = "isoContainer";
	
	//create part toggling list of checkboxes
	var partToggle = document.createElement("div");
	partToggle.className = "partToggle";
	//iterate through parts
	for(var p=0,nParts=parts.length; p<nParts; p++){
		//create label for checkbox
		var label = document.createElement("p"); //<label> isn't worth it, too complicated and not really different in this case
		label.className = "checkboxLabel";
		label.innerText = "Part "+p+" Visible ";
		partToggle.appendChild(label);
		
		//create checkbox
		var cBox = document.createElement("input");
		cBox.type = "checkbox";
		cBox.checked = "true"; //true is arbitrary, the attribute just needs to exist
		cBox.className = "checkbox";
		(function(solutionNum,p){ //to make solutionNum and the part number independent of the loop
			cBox.addEventListener("change",function(e){
				togglePartVisibility(solutionNum,p);
			});
		})(solutionNum,p);
		partToggle.appendChild(cBox);
		
		if(p < nParts-1){
			partToggle.appendChild(document.createElement("br")); //add a line break, unless after the last checkbox
		}
	}
	isoContainer.appendChild(partToggle);
	
	//create canvas
	var canvas = document.createElement("canvas");
	canvas.id = "solution"+solutionNum+"canvas";
	canvas.width = 500;
	canvas.height = 500;
	canvas.className = "isoCanvas";
	drawIsometric(canvas,solution);
	CANVAS = canvas;
	isoContainer.appendChild(canvas);
	
	container.appendChild(isoContainer);
	
	//end of iso stuff ----------------------------------------------------
	
	document.getElementById("solutionsContainer").appendChild(container);
}


//toggle part visibility in solutions; event listener set up above in addSolution()
function togglePartVisibility(solution,part){ //solution and part are both numbers
	if(solutions.length === 0){return}
	
	//iterate through solution array
	for(var tier=0; tier<solutions[solution].length; tier++){
		for(r=0; r<solutions[solution][0].length; r++){
			for(c=0; c<solutions[solution][0][0].length; c++){
				var cell = solutions[solution][tier][r][c];
				if(cell === "p"+part){ //means the part is currently being displayed
					solutions[solution][tier][r][c] = "_"+part; //flag for not drawing the part
				}
				else if(cell === "_"+part){ //means the part is currently not being displayed
					solutions[solution][tier][r][c] = "p"+part; //flag for drawing the part
				}
			}
		}
	}
	
	//draw updated solution array
	drawIsometric(document.getElementById("solution"+solution+"canvas"), solutions[solution]);
}