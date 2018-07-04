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



function updateDisplay(){
	for(var r=0; r<nonogram.length; r++){
		for(var c=0; c<nonogram[0].length; c++){
			var cell = document.getElementById(r+"-"+c);
			
			switch(nonogram[r][c]){
				case -1:
					cell.style.backgroundColor = "white";
					cell.innerHTML = "&#10006;"; //heavy multiplication sign
					break;
				case 0:
					cell.style.backgroundColor = "white";
					cell.innerText = "";
					break;
				case 1:
					cell.style.backgroundColor = "black";
					cell.innerText = "";
			}
		}
	}
}



//makes an array with the default value provided
function array(length,defaultVal=0){
	var a = [];
	for(var i=0; i<length; i++){
		if(typeof defaultVal === "object"){defaultVal = deepCopy(defaultVal)}
		a.push(defaultVal);
	}
	return a;
}