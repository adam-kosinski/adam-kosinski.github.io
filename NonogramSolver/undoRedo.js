function undo(){
	if(nonogramHistory.length > 0){
		nonogramFuture.push(deepCopy(nonogram));
		
		nonogram = nonogramHistory.splice(nonogramHistory.length-1, 1)[0];
		
		updateDisplay(); //in utilities.js
		
	} else {alert("Cannot undo any further.")}
}


function redo(){
	if(nonogramFuture.length > 0){
		nonogramHistory.push(deepCopy(nonogram));
		
		nonogram = nonogramFuture.splice(nonogramFuture.length-1, 1)[0];
		
		updateDisplay();
		
	} else {alert("Cannot redo any further.")}
}