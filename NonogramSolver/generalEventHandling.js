document.addEventListener("keypress",keypress);
document.getElementById("x").addEventListener("click",function(){
	document.getElementById("uploadDownloadWindow").style.display = "none";
	dialogOpen = false;
});
window.addEventListener("beforeunload",function(e){
	e.returnValue = ""; //this will trigger a confirmation message about leaving the site
});
window.addEventListener("resize", function(){centerTable()});


function keypress(e){
	if(enteringData || dialogOpen || !nonogramLoaded){return}
	
	if(e.code === "KeyZ" && e.ctrlKey){
		undo();
	}
	if(e.code === "KeyY" && e.ctrlKey){
		redo();
	}
	if(e.key === " "){ //if space key pressed
		document.getElementById("uploadDownloadWindow").style.display = "block";
		dialogOpen = true;
	}
}


