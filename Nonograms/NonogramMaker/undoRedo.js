function undo(){
	if(nonogramHistory.length > 0){
		nonogramFuture.push(deepCopy(nonogram));
		
		nonogram = nonogramHistory.splice(nonogramHistory.length-1, 1)[0];
		
		
		globalVarFuture.push({minX:minX, minY:minY, xOffset:xOffset, yOffset:yOffset});
		
		var globalVars = globalVarHistory.splice(globalVarHistory.length-1, 1)[0];
		minX = globalVars.minX;
		minY = globalVars.minY;
		xOffset = globalVars.xOffset;
		yOffset = globalVars.yOffset;
		
		
		canvasFuture.push(ctx.getImageData(0,0,canvas.width,canvas.height));
		
		ctx.clearRect(0,0,canvas.width,canvas.height);
		var imageData = canvasHistory.splice(canvasHistory.length-1, 1)[0]
		ctx.putImageData(imageData, 0, 0);
		
	} else {alert("Cannot undo any further.")}
}


function redo(){
	if(nonogramFuture.length > 0){
		nonogram = nonogramFuture.splice(nonogramFuture.length-1, 1)[0];
		
		var globalVars = globalVarFuture.splice(globalVarFuture.length-1, 1)[0];
		minX = globalVars.minX;
		minY = globalVars.minY;
		xOffset = globalVars.xOffset;
		yOffset = globalVars.yOffset;
		
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.putImageData(canvasFuture.splice(canvasFuture.length-1, 1)[0], 0, 0);
	} else {alert("Cannot redo any further.")}
}