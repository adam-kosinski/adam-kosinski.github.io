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

function arrayWithDimensions(nTiers,nRows,nCols){ //default fill-in value is 0
	var newArray = [];
	
	for(var t=0; t<nTiers; t++){
		var newTier = [];
		for(var r=0; r<nRows; r++){
			var newRow = [];
			for(var c=0; c<nCols; c++){
				newRow.push(0);
			}
			newTier.push(newRow);
		}
		newArray.push(newTier);
	}
	
	return newArray;
}

function hexToNum(hex){ //hex is a string of length 2
	var first = hex[0];
	var second = hex[1];
	
	if(/[a-f]/.test(first)){
		switch(first){
			case 'a': first=10; break;
			case 'b': first=11; break;
			case 'c': first=12; break;
			case 'd': first=13; break;
			case 'e': first=14; break;
			case 'f': first=15; break;
		}
	} else {first = Number(first)}
	
	if(/[a-f]/.test(second)){
		switch(second){
			case 'a': second=10; break;
			case 'b': second=11; break;
			case 'c': second=12; break;
			case 'd': second=13; break;
			case 'e': second=14; break;
			case 'f': second=15; break;
		}
	} else {second = Number(second)}
	
	return (first*16) + second;
}