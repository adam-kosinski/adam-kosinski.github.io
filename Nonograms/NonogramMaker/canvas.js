var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var body = document.body;
var uploadDownloadWindow = document.getElementById("upload-download");

var gridSquareSize = 30; //px

/* Nomenclature
x or y (lowercase) - pixels
X or Y - grid square on screen with respect to top-leftmost showing square being (0,0)
absX or absY (or any prefix) - absolute location, in grid squares
*/

var xOffset = 10; //displacement of original canvas origin (location on canvas defined by xOffset and yOffset - not actual origin movement) with respect to literal canvas origin
var yOffset = 10;

var minX; //used for determining nonogram size; also essentially the "origin" (top-left corner) of the nonogram drawing
var minY;


var nonogram = []; //uses r,c format = Y,X

var name = ""; //name of the nonogram, used to make sure is the same name when downloading after an edit

//save state variables
var canvasHistory = [];
var nonogramHistory = [];
var globalVarHistory = [];

var canvasFuture = [];
var nonogramFuture = [];
var globalVarFuture = [];


//flags
var dragging = false;
var keyIsDown = false;
var enteringData = false;
var dataToEnter = 1; //use 1 as default, other option is 0
var uploadDownloadWindowOpen = false;


//functions
	window.addEventListener("resize",windowResized);
function windowResized(){
	var savedImageData = ctx.getImageData(0,0,canvas.width,canvas.height);
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	ctx.putImageData(savedImageData,0,0);
	
	//clear then redraw gridlines (so don't layer up and get darker)
	drawGridlines("#fff");
	drawGridlines("lightblue");
	
	drawData(minX,minY);
	
	console.log("window resized");
}



function drawGridlines(strokeStyle="lightblue",borders={xMin:0, xMax:canvas.width, yMin:0, yMax:canvas.height}) {
	//borders is an object with properties: xMin, xMax, yMin, yMax; specifies where to draw the borders (to cut down on amount of looping needed)
	
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = 1;
	
		//draw horizontal lines
	for(var y = mod(yOffset,gridSquareSize); y < borders.yMax; y += gridSquareSize){
		if(borders.yMin <= y && y <= borders.yMax){
			ctx.beginPath();
			ctx.moveTo(borders.xMin,y);
			ctx.lineTo(borders.xMax,y);
			ctx.stroke();
		}
	}
		//draw vertical lines
	for(var x = mod(xOffset,gridSquareSize); x < borders.xMax; x += gridSquareSize){
		if(borders.xMin <= x && x <= borders.xMax){
			ctx.beginPath();
			ctx.moveTo(x,borders.yMin);
			ctx.lineTo(x,borders.yMax);
			ctx.stroke();
		}
	}
}


//multi-use or general event listeners
document.addEventListener("keypress",keypress);
canvas.addEventListener("mousedown",mousedown);
canvas.addEventListener("mouseup",mouseup);
canvas.addEventListener("mousemove",mousemove);
window.addEventListener("beforeunload",function(e){
	e.returnValue = ""; //this will trigger a confirmation message about leaving the site
});

function keypress(e){
	if(dragging || enteringData || uploadDownloadWindowOpen){return}
	
	if(e.code === "KeyZ" && e.ctrlKey){
		undo();
	}
	if(e.code === "KeyY" && e.ctrlKey){
		redo();
	}
	if(e.key === " "){ //if space key pressed
		uploadDownloadWindow.style.display = "block";
		uploadDownloadWindowOpen = true;
	}
}

function mousedown(e){
	if(uploadDownloadWindowOpen){return}
	
	if(e.shiftKey){ //shift key must be depressed in order to start dragging
		console.log("down shift")
		dragging = true;
		canvas.style.cursor = "-webkit-grabbing";
	} else { //if shift key not depressed, mouse down for data entry
			//save canvas and data
		canvasHistory.push(ctx.getImageData(0,0,canvas.width,canvas.height));
		nonogramHistory.push(deepCopy(nonogram));
		globalVarHistory.push({minX:minX, minY,minY, xOffset:xOffset, yOffset:yOffset});
			//clear future data, because can't have multiple future/past histories
		canvasFuture = [];
		nonogramFuture = [];
		globalVarFuture = [];
		
			//do data entry stuff
		enteringData = true;
		enterData(e,true);
	}
}

function mouseup(e){
	if(enteringData){
		enteringData = false;
	}
	if(dragging) {
		dragging = false;
		if(e.shiftKey){
			canvas.style.cursor = "-webkit-grab";
		} else {
			canvas.style.cursor = "default";
		}
	}
}

function mousemove(e){
	if(dragging){drag(e)}
	else if(enteringData){enterData(e)}
}

//misc. event handlers
document.getElementById("x").addEventListener("click",function(){
	uploadDownloadWindow.style.display = "none";
	uploadDownloadWindowOpen = false;
});



//initialization
windowResized();
