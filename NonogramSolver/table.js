function createTable(){
	var table = document.createElement("table");
	table.id = "nonogram";
	var tbody = document.createElement("tbody");
	
	for(var r=0; r<=clues.rows.length; r++){ //less than or equal b/c of one row required to display the clues
		var tr = document.createElement("tr");
		for(var c=0; c<=clues.cols.length; c++){
			var td = document.createElement("td");
			
			if(r === 0 && c === 0){
				td.className = "topLeft";
			}
			else if(r === 0 && c !== 0){ //col clues
				var clueText = clues.cols[c-1].join("\n");
				td.innerText = clueText;
				td.style.verticalAlign = "bottom";
				td.id = "c"+(c-1);
				td.className = "colClue";
			}
			else if(c === 0 && r !== 0){ //row clues
				var clueText = clues.rows[r-1].join(" ");
				td.innerText = clueText;
				td.style.textAlign = "right";
				td.id = "r"+(r-1);
				td.className = "rowClue";
			}
			else {
				td.className = "generic";
				td.id = (r-1)+"-"+(c-1);
			}
			
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	document.body.appendChild(table);
	
	//center table
	centerTable();
	
	//enable data entry and undo/redo functionality
	table.addEventListener("mousedown",function(e){
		nonogramHistory.push(deepCopy(nonogram));
		nonogramFuture = [];
		
		enteringData = true;
		enterData(e);
	});
	table.addEventListener("mousemove",mousemove);
	table.addEventListener("contextmenu",function(e){e.preventDefault()}); //prevent right clicks from opening the menu
	
	nonogramLoaded = true;
}



//make sure table is centered; event listener set up when table is created (table.js or enterNonogram.js)
function centerTable(){
	var table = document.getElementById("nonogram");
	if(!table){return}
	var rect = table.getBoundingClientRect();
	
	table.style.left = ((window.innerWidth - rect.width) / 2) + "px";
	table.style.top = ((window.innerHeight - rect.height) / 2) + "px";
}




//control entering data flag to allow mousemove data entry
	document.addEventListener("mouseup",mouseup);
function mouseup(e){
	enteringData = false;
}




function enterData(e,determineDataToEnter=true){ //2nd argument will be passed as false if function called as a result of a mousemove
	if(dialogOpen){return}
	
	console.log(e.buttons);
	
	var cell = e.target;
	if(cell.classList[0] !== "generic"){return}
	
	var r = Number(cell.id.split("-")[0]);
	var c = Number(cell.id.split("-")[1]);
	
	//determine data to enter
	if(determineDataToEnter){
		//if something is in the cell, both types of click will clear it
		if(nonogram[r][c] !== 0){
			dataToEnter = 0;
		}
		
		//otherwise, left click fills the cell, and right click puts an x in it
		else if(e.buttons === 1){ //left click
			dataToEnter = 1;
		}
		else if(e.buttons === 2){ //right click
			dataToEnter = -1;
		}
	}
	
	//enter data
	switch(dataToEnter){
		case -1:
			nonogram[r][c] = -1;
			cell.innerHTML = "&#10006;"; //'heavy multiplication sign'
			break;
		case 0:
			nonogram[r][c] = 0;
			cell.style.backgroundColor = "white";
			cell.innerText = "";
			break;
		case 1:
			nonogram[r][c] = 1;
			cell.style.backgroundColor = "black";
			break;
	}
}





function mousemove(e){ //in order for this to execute, the mouse still has to be moving over the cell after a certain amount of time has passed (defined in globalVariables.js)
	e.preventDefault();
	
	//check if can enter data
	if(enteringData && e.target === prevMousemoveTarget && mousemoveTimerDone){
		enterData(e,false);
	}
	
	//clear last timeout and start a new one
	else if(prevMousemoveTarget !== e.target){ //only clear timeout and start a new one if moved to a different cell
		//clear previous timer
		if(mousemoveTimerId){
			clearTimeout(mousemoveTimerId);
		}
		mousemoveTimerDone = false; //is needed b/c this block of code will be called even after the timer finished, this resets the variable
		
		//new timer
		mousemoveTimerId = setTimeout(function(){
			mousemoveTimerDone = true;
		},timeoutTime);
	}
	
	prevMousemoveTarget = e.target;
}