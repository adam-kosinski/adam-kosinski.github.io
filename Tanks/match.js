function startMatch(){
	//set up objects
	tanks = [];
	tanks.push(new Tank(20,20,0,"red",{moveForward:"e",moveBackward:"d",rotateClockwise:"f",rotateCounterclockwise:"s",fireBullet:"q"}));
	tanks.push(new Tank(20,100,20*Math.PI/180,"green",{moveForward:"ArrowUp",moveBackward:"ArrowDown",rotateClockwise:"ArrowRight",rotateCounterclockwise:"ArrowLeft",fireBullet:"m"}));
	
	bullets = [];
	
	explosions = [];
	
	obstacles = [];
	obstacles.push(new Obstacle([50,50],[150,50],[150,200],[50,200]))
	//obstacles.push(new Obstacle([200,50],[300,100],[200,200],[250,110]))
	
	//start loop that runs the game
	mainLoopID = setInterval(mainLoop, 1000/fps); //mainLoop function defined in mainLoop.js; mainLoopID is a global variable
}