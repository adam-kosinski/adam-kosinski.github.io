//references
var scrollContainer = document.getElementById("scrollContainer");
var alignContainer = document.getElementById("alignContainer");
var outputTable = document.getElementById("outputTable");
var input = document.getElementById("input");
var footer = document.getElementById("footer");
var clearEntryButton = document.getElementById("clearEntryButton");
var clearEntriesButton = document.getElementById("clearEntriesButton");
var answerButton = document.getElementById("answerButton");

//finish styling elements
scrollContainer.style.height = window.innerHeight - footer.getBoundingClientRect().height + "px";
alignContainer.style.height = window.innerHeight - footer.getBoundingClientRect().height + "px";
outputTable.style.width = window.innerWidth + "px";

//set up event listeners
document.addEventListener("keypress",handleKeypress);
clearEntryButton.addEventListener("click",handleClearEntryButtonClick);
clearEntriesButton.addEventListener("click",handleClearEntriesButtonClick);
answerButton.addEventListener("click",handleAnswerButtonClick);

function handleKeypress(e){
	input.focus(); //typing anywhere will redirect to input element
	if(e.key === "Enter" && input.value.length > 0){
		submitInput(input.value);
		input.value = "";
	}
}

function handleClearEntryButtonClick(){
	clearEntry = confirm("Are you sure you want to clear your most recent entry?");
	if(clearEntry && outputTable.firstElementChild.lastElementChild){
		outputTable.firstElementChild.removeChild(outputTable.firstElementChild.lastElementChild);
	}
}

function handleClearEntriesButtonClick(){
	clearEntries = confirm("Are you sure you want to clear your entries?");
	if(clearEntries && outputTable.firstElementChild.firstElementChild){
		outputTable.firstElementChild.innerHTML = "";
	}
}

function handleAnswerButtonClick(){
	showAnswer = confirm("Are you sure you want to reveal the answer?");
	if(showAnswer){
		alert(answer);
	}
}

function submitInput(inputString){
	console.log(JSON.parse(JSON.stringify(inputString)))
	
	//run input through blackbox to get output
	var output = inputString;
	for(var i=0; i<blackbox.length; i++){
		output = blackbox[i](output);
	}
	
	//add display row
	var tr = document.createElement("tr");
	var tdIn = document.createElement("td");
		tdIn.textContent = inputString;
	var tdArrow = document.createElement("td");
		tdArrow.textContent = "\u279c";
	var tdOut = document.createElement("td");
		tdOut.textContent = output;
	tr.appendChild(tdIn);
	tr.appendChild(tdArrow);
	tr.appendChild(tdOut);
	outputTable.firstElementChild.appendChild(tr);
	
	//scroll to bottom of output (so most recent entry is visible)
	scrollContainer.scrollTop = scrollContainer.scrollHeight; //this actually 'scrolls' down further than need to, but display will go to max scroll instead
}

// <<<<<<<<<<<<< BLACKBOX FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.
var nOfFn = 3; //number of functions to run user input through to get output
var allowRepeats = false; //true if the same function is allowed twice in the blackbox (but still not next to each other)
var blackbox = []; //will store chosen used functions from fnLibrary below
var answer = ""; //will store answer display strings
var fnLibrary = [
	(function init(){ //initialize function with a fixed amount to add: -10 to -1 or 1 to 10
		var amountToAdd = (Math.floor(Math.random()*2) ? 1 : -1) * Math.ceil(Math.random()*10);
		function add(inputString){
			if(isNaN(Number(inputString))) {return inputString}
			return Number(inputString) + amountToAdd;
		}
		add.display = "Add "+amountToAdd;
		return add;
	})(),
	(function init(){ //initialize function with a fixed amount to multiply: -10 to -1 or 1 to 10
		var amountToMultiply = (Math.floor(Math.random()*2) ? 1 : -1) * Math.ceil(Math.random()*10);
		function multiply(inputString){
			if(isNaN(Number(inputString))) {return inputString}
			return Number(inputString) * amountToMultiply;
		}
		multiply.display = "Multiply By "+amountToMultiply;
		return multiply;
	})(),
	(function init(){
		var intervalToFloorTo = Math.ceil(Math.random()*10);
		function floor(inputString){
			if(isNaN(Number(inputString))) {return inputString}
			return inputString - (inputString % intervalToFloorTo);
		}
		floor.display = "Round down to nearest multiple of "+intervalToFloorTo;
		return floor;
	})(),
	(function init(){
		var exponent = Math.floor(Math.random()*5);
		function toPower(inputString){
			if(isNaN(Number(inputString))) {return inputString}
			return Math.pow(Number(inputString),exponent);
		}
		toPower.display = "Raise number to the power of "+exponent;
		return toPower;
	})(),
	(function init(){
		function len(inputString){
			return String(inputString).length;
		}
		len.display = "Get length of value";
		return len;
	})(),
	(function init(){
		function reverse(inputString){
			inputString = String(inputString);
			var reversedString = "";
			for(var i=inputString.length-1; i>=0; i--){
				reversedString += inputString[i];
			}
			return reversedString;
		}
		reverse.display = "Reverse the order of characters";
		return reverse;
	})()
/*	(function init(){
		
		function ____(inputString){
			
		}
		____.display = "";
		return ____;
	})()
*/
];

//pick functions for blackbox
var fnLibraryWOPrevChoice = fnLibrary.slice(); //I don't want to use the same function twice in a row; will pick from this array not containing prev choice
for(var fn=0; fn<nOfFn; fn++){
	var fnToUse = fnLibraryWOPrevChoice[Math.floor(Math.random()*fnLibraryWOPrevChoice.length)]; //get random function from library
	blackbox.push(fnToUse);
	answer += fnToUse.display + "\n";
	fnLibraryWOPrevChoice = fnLibrary.slice(); //reset working library to all options
	fnLibraryWOPrevChoice.splice(fnLibrary.indexOf(fnToUse),1); //remove option that was just used
	if(!allowRepeats){ //if not allowing repeats, remove function from original library as well
		fnLibrary.splice(fnLibrary.indexOf(fnToUse),1);
	}
}