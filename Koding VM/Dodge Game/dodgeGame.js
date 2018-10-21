var field = document.getElementById("field");
var ctx = field.getContext("2d");
ctx.fillStyle = "rgb(255,0,0)";


var score = 0;


var mouseX;
var mouseY;

var mainInterval;


var gameOver = true;

// start game
field.addEventListener("click",function(e){
	//if game going on, don't do this
	if(!gameOver) {return}
	score = 0;
	
	//set mouse coords (relative to canvas)
	mouseX = e.layerX;
	mouseY = e.layerY;
	
	mainInterval = setInterval(function(){
		//choose a new location
		var lane = Math.floor(Math.random()*5);
		
		var xPos = -140;
		
		// animate
		var intervalID = setInterval(function(){
			// clear lane
			ctx.clearRect(xPos - 20,lane*140,140,140);
			
			// if needed, stop drawing the rectangle
			if(xPos >= 700) {
				clearInterval(intervalID);
			} else {
				ctx.fillRect(xPos,lane*140,140,140);
			}
			
			//increment drawing spot
			xPos += 20;
		}, 25);
		
		
		score++;
	}, 250);

	gameOver = false;
});

//check for if mouse is on a red box every 20 milliseconds
setInterval(function(){
	if(gameOver) {return} /*to stop this from checking before any mouseCoords have been defined,
	and also doesn't make much sense to check when game isn't going on*/
	
	var pixel = ctx.getImageData(mouseX, mouseY, 1, 1);
	var data = pixel.data;
	
	if(data[0] > 200 && !gameOver) { //checks if it's red
		clearInterval(mainInterval);
		alert("END OF GAME. Score: "+score);
		gameOver = true;
	}
}, 20);

field.addEventListener("mousemove",function(e){
	mouseX = e.layerX;
	mouseY = e.layerY;
});

//detect if mouse moved out of field canvas
document.getElementsByTagName("body")[0].addEventListener("mousemove",function(e){
	if(e.target != field && !gameOver) {clearInterval(mainInterval);
		alert("END OF GAME. Score: "+score);
		gameOver= true;
	}
});