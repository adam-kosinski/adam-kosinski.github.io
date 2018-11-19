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