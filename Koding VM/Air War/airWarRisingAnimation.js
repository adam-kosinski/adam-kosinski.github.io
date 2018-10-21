function riseAnimate(centerElement,textContent,style){
	/*	centerElement: element on which original position of textContent will be centered
		textContent: visible text that will rise
		style: CSS styling to be applied to <p> element that will house textContent
	*/
	
	disableClicks();
	
	var body = document.getElementsByTagName("body")[0];
	
	//set up element
	var riseElement = document.createElement("p");
	riseElement.textContent = textContent;
	for(prop in style){
		riseElement.style[prop] = style[prop];
	}
	riseElement.style.position = "absolute";
	riseElement.style.zIndex = 15;
	riseElement.style.margin = 0;
	
	//add to body
	body.appendChild(riseElement);
	
	//determine element offset relative to body in order to center <p> on centerElement
	var centerElRect = centerElement.getBoundingClientRect();
	var bodyRect = body.getBoundingClientRect();
	var riseElRect = riseElement.getBoundingClientRect();
	riseElement.style.top = (centerElRect.top + centerElRect.height/2) - bodyRect.top - (riseElRect.height/2) + "px";
	riseElement.style.left = (centerElRect.left + centerElRect.width/2) - bodyRect.left - (riseElRect.width/2) + "px";
	
	//animate riseElement
	
	
	enableClicks();
	
	return riseElement;
}
/*
var style = {
	color: 'red',
	fontSize: '24px'
}
riseAnimate(document.getElementById('blueBase'),'hello',style)
*/