document.addEventListener("keydown", handleKeyEvent);
document.addEventListener("keyup", handleKeyEvent);
window.addEventListener("beforeunload", handleBeforeUnloadEvent);
document.addEventListener("mousemove", userInteracted);

//function to handle keydowns and keyups that occur on the document (for controlling tanks)
function handleKeyEvent(e){	
	userInteracted(); //see below
	
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



//functions used to transition to the fun version
function handleBeforeUnloadEvent(e){
	tried_to_leave = true; //global var
	
	//ask user if they're sure they want to leave the page
	e.preventDefault();
	e.returnValue = "blah"; //have to do this as well to make it work in chrome
	
	//to detect if they stayed, we're going to watch mousemove and key events - calling userInteracted() if detected them
	//and then set a timeout after that for switch to fun version
	//to allow any exiting so we don't switch to fun version in that small period of time when the page is unloading
}

function userInteracted(){
	if(!tried_to_leave){return}
	else {
		tried_to_leave = false; //reset this
		
		setTimeout(function(){
			//ask to switch to fun version
			fun_version = confirm("Since you were so nice not to leave, we have a special treat for you. Would you like it?"); //fun_version is a global var
			if(fun_version){
				endMatch();
				startMatch();
			}
		},3000);
	}
}