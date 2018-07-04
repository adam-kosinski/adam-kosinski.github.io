document.getElementById("create").addEventListener("click",loadEnteringInterface);

//create div element that will be moved around or hidden/shown to allow inputting of clue data
var clueInputter = document.createElement("div");
clueInputter.id = "clueInputter";
clueInputter.contentEditable = "true";
document.body.appendChild(clueInputter);

clueInputter.addEventListener("keypress", clueInputKeypress); //see below

//move cursor to end of clueInputter when clicked on - I got this code from stack overflow, but it works!
clueInputter.addEventListener("focus",function(){
	var range = document.createRange();//Create a range (a range is a like the selection but invisible)
	range.selectNodeContents(clueInputter);//Select the entire contents of the element with the range
	range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
	var selection = window.getSelection();//get the selection object (allows you to change selection)
	selection.removeAllRanges();//remove any selections already made
	selection.addRange(range);//make the range you have just created the visible selection
});

//sometimes, clueInputter will blur w/o a click on the document... still want to save data
clueInputter.addEventListener("blur",function(){
	//simulate a click on the body to call editClue and the saving script in there
	document.body.click();
});



function loadEnteringInterface(){
	//determine number of rows
	do {
		var nOfR = prompt("Number of rows:\n\nNote: You can change this number later.");
		if(nOfR !== null){nOfR = Number(nOfR)}
		else {return}
	} while (nOfR !== Math.trunc(nOfR) || nOfR <= 0);
	//determine number of cols
	do {
		var nOfC = prompt("Number of columns:\n\nNote: You can change this number later.");
		if(nOfC !== null){nOfC = Number(nOfC)}
		else {return}
	} while (nOfC !== Math.trunc(nOfC) || nOfC <= 0);
	
	//create data storage for clues
	clues = {
		rows: array(nOfR, []), //I checked, this won't run into reference/deep copy issues
		cols: array(nOfC, [])
	}
	
	//create table and nonogram data storage
	var table = document.createElement("table");
	table.id = "nonogram";
	var tbody = document.createElement("tbody");
	
	for(var r=0; r<=nOfR; r++){ //less than or equal b/c of one row required to display the clues
		var tr = document.createElement("tr");
		var row = [];
		for(var c=0; c<=nOfC; c++){
			var td = document.createElement("td");
			row.push(0);
			
			if(r === 0 && c === 0){
				td.className = "topLeft";
			}
			else if(r === 0 && c !== 0){ //col clues
				td.style.verticalAlign = "bottom";
				td.id = "c"+(c-1);
				td.className = "colClue";
				td.innerText = "";
			}
			else if(c === 0 && r !== 0){ //row clues
				td.style.textAlign = "right";
				td.id = "r"+(r-1);
				td.className = "rowClue";
				td.innerText = "";
			}
			else {
				td.className = "generic";
				td.id = (r-1)+"-"+(c-1);
			}
			
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
		nonogram.push(row);
	}
	table.appendChild(tbody);
	document.body.appendChild(table);
	
	//center table
	centerTable();
	
	//prevent right clicks from opening the menu
	table.addEventListener("contextmenu",function(e){e.preventDefault()});
	
	//create event listener for clue editing
	document.addEventListener("click",editClue);
	
	
	
	
	
	
	
	
	
		//don't allow more than one nonogram per page refresh, b/c gets complicated if do, and refreshing isn't an issue
	document.getElementById("upload").style.display = "none";
	document.getElementById("create").style.display = "none";
	
	//close management window
	document.getElementById("uploadDownloadWindow").style.display = "none";
	document.getElementById("download").style.display = "block";
	document.getElementById("x").style.display = "block";
	dialogOpen = false;
	
}




function editClue(e){ //by the way, this gets triggered for ALL clicks on the document
	if(nonogramLoaded){return} //no editing after nonogram becomes playable
	if(e.target === clueInputter){console.log(window.getSelection());return}
	if(e.target === clueInputter.parentElement){ //don't change anything if inputter already in the element clicked on
		clueInputter.focus(); //focus might've been lost, refocus
		return;
	}
	
	//first, save edit if previous parent was a clue table cell - b/c of check above, this won't trigger on the cell the inputter is currently in (inputter is definitely moving somewhere different)
	var parentClass = clueInputter.parentElement.classList[0];
	if(parentClass === "rowClue" || parentClass === "colClue"){
		//save data - filter input first
			//no lone zeros or zeros directly followed by a digit allowed
		if(/\b0\b|0(?=\d)/.test(clueInputter.innerText)){
			clueInputter.innerText = clueInputter.innerText.replace(/\b0\b|0(?=\d)/g,""); // \b is a word boundary - matches where a character isn't preceeded or followed by a word character
			centerTable();
		}
			//only one consecutive whitespace allowed
		if(/\s(?=\s)/.test(clueInputter.innerText)){
			clueInputter.innerText = clueInputter.innerText.replace(/\s(?=\s)/g, "");
			centerTable();
		}
			//remove whitespace from beginning or end
		if(/^\s|\s$/.test(clueInputter.innerText)){
			clueInputter.innerText = clueInputter.innerText.replace(/^\s|\s$/g,"");
			centerTable();
		}
			//save the data
		var clueList = clueInputter.innerText.split(/\s/); // '\s' matches any whitespace character
		var i = Number(clueInputter.parentElement.id.substring(1)); //exclude the 'r' or 'c' identifier in the id
		if(clueList.length <= 1 && clueList[0] === ""){ //means nothing was entered
			clueList = []; //default clue list is a blank array
		} else {
			for(var x=0; x<clueList.length; x++){
				clueList[x] = parseInt(clueList[x], 10); //going way too overboard here to ensure stuff comes out right, but whatever
			}
		}
		if(parentClass === "rowClue"){
			clues.rows[i] = clueList;
		}
		if(parentClass === "colClue"){
			clues.cols[i] = clueList;
		}
		
		//save display
		clueInputter.parentElement.innerText = clueInputter.innerText; //By the way: this will clear the parent element's children, including clueInputter, but we don't need to access the parent element anymore
		
		//reset clueInputter contents
		clueInputter.innerText = ""; //not necessary, but probably less confusion if completely reset it
	}
	
	
	//reset clueInputter styling
	clueInputter.style.height = "initial";
	clueInputter.style.width = "initial";
	clueInputter.style.display = "block";
	
	if(e.target.classList[0] === "rowClue"){
		clueInputter.style.height = getComputedStyle(e.target).height;
		
		clueInputter.innerText = e.target.innerText;
		e.target.innerText = "";
		
		e.target.appendChild(clueInputter);
		clueInputter.focus();
	}
	else if(e.target.classList[0] === "colClue"){
		clueInputter.style.width = getComputedStyle(e.target).width;
		
		clueInputter.innerText = e.target.innerText;
		e.target.innerText = "";
		
		e.target.appendChild(clueInputter);
		clueInputter.focus();
	}
	else {
		//hide the inputter and center the table
		document.body.appendChild(clueInputter);
		clueInputter.style.display = "none";
		centerTable();
	}
}



function clueInputKeypress(e){ //FYI backspace gets captured on keydown
	//prevent any characters except digits and correct type of whitespace (space or linebreak) being entered
	var clueClass = clueInputter.parentElement.classList[0];
	if(clueClass === "rowClue"){
		if(!/[0-9 ]/.test(e.key)){
			e.preventDefault();
			return;
		}
	}
	if(clueClass === "colClue"){
		if(!/[0-9]|Enter/.test(e.key)){
			e.preventDefault();
			return;
		}
	}
	
	//input rules taken care of in editClue() in the save data section
}






function checkInput(){ //checks all of inputted clue data to make sure it's legitimate (e.g. can't have clue specifying 9 long when nonogram is 6 long), returns true if good, false if not
	
}