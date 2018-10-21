//references
var body = document.getElementsByTagName("body")[0];
var canvas = document.getElementById("canvas");
var varianceDisplay = document.getElementById("varianceDisplay");

//set up dimensions
canvas.style.height = canvas.height + "px";
canvas.style.width = canvas.width + "px";

//set up rendering context
var ctx = canvas.getContext("2d");
ctx.strokeStyle = "lightgray";
ctx.lineWidth = 10;
ctx.lineCap = "round";

//Event listeners!
function handleMousemove(e){
	//console.log(e.offsetX,e.offsetY)
	if(key === "d"){
		ctx.lineTo(e.offsetX,e.offsetY);
		ctx.stroke();
	}
}

//function to help w/ developing code; tells coords of click
function handleDblclick(e){
	console.log(e.offsetX,e.offsetY);
	if(key === "Shift"){essentialPixels.push([e.offsetX,e.offsetY])}
	
}

var key; //stores pressed key
function handleKeydown(e){
	e.preventDefault();
	if(!key){
		key = e.key
		console.log(key);
		if(key === "d"){ctx.beginPath()}
	}
}

var data;
function handleKeyup(e){
	ctx.stroke(); //multiple strokes to thicken the line
	ctx.stroke();
	ctx.stroke();
	if(key === "d"){data = binarizeCanvas(ctx)}
	key = undefined;
}

//Bind Event Listeners!
canvas.addEventListener("mousemove",handleMousemove);
canvas.addEventListener("dblclick",handleDblclick);
body.addEventListener("keydown",handleKeydown);
body.addEventListener("keyup",handleKeyup);