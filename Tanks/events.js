document.addEventListener("keydown", handleKeyEvent);
document.addEventListener("keyup", handleKeyEvent);

//function to handle keydowns and keyups that occur on the document (for controlling tanks)
function handleKeyEvent(e){	
	//check if an invalid event was passed
	if(e.type !== "keydown" && e.type !== "keyup"){
		throw new Error("Event passed to handleKeyEvent that isn't keydown or keyup");
	}
	
	//check if there's no binding for this key
	if(!keyConfig[e.key]){
		return;
	}
		
	//otherwise, call the bound function, only if this event is different from the previous event that occurred on this key - to bypass rapid fire keydown events
	if(keyConfig[e.key].prevEvent !== e.type){
		keyConfig[e.key].prevEvent = e.type;
		
		keyConfig[e.key][e.type](); //see globals.js for documentation on keyConfig
	}
}