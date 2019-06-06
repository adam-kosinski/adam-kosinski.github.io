function startGame(...player_colors){ //length of arguments list is 
	
}

function startMatch(){
	//just in case we didn't call endMatch()
	clearInterval(mainLoopID);
		
	//set up objects
	tanks = [];
	let red_x = canvas.width*Math.random();
	let red_y = canvas.height*Math.random();
	let red_theta = 0.25*Math.PI*Math.floor(8*Math.random());
	tanks.push(new Tank(red_x,red_y,red_theta,"red",{moveForward:"e",moveBackward:"d",rotateClockwise:"f",rotateCounterclockwise:"s",fireBullet:"q"}));
	let green_x = canvas.width*Math.random();
	let green_y = canvas.height*Math.random();
	let green_theta = 0.25*Math.PI*Math.floor(8*Math.random());
	tanks.push(new Tank(green_x,green_y,green_theta,"green",{moveForward:"ArrowUp",moveBackward:"ArrowDown",rotateClockwise:"ArrowRight",rotateCounterclockwise:"ArrowLeft",fireBullet:"m"}));
	
	if(!score_display_generated){score_display_generated = true}
	
	bullets = [];
	
	explosions = [];
	
	obstacles = [];
	for(let r=0; r<obstacleGrid.length; r++){
		for(let c=0; c<obstacleGrid[0].length; c++){
			obstacleGrid[r][c] = 0;
		}
	}
	generateObstacles(nObstaclesToGenerate); //function in obstacles.js
	
	//bound playing field with 100px border (false args so these don't move for fun version)
	obstacles.push(new Obstacle([-1000,-1000],[canvas.width+1000,-1000],[canvas.width+1000,0],[-1000,0],false)); //top
	obstacles.push(new Obstacle([-1000,canvas.height],[canvas.width+1000,canvas.height],[canvas.width+1000,canvas.height+1000],[-1000,canvas.height+1000],false)); //bottom
	obstacles.push(new Obstacle([-1000,-1000],[0,-1000],[0,canvas.height+1000],[-1000,canvas.height+1000],false)); //left
	obstacles.push(new Obstacle([canvas.width,-1000],[canvas.width+1000,-1000],[canvas.width+1000,canvas.height+1000],[canvas.width,canvas.height+1000],false)); //right
	
	//obstacles.push(new Obstacle([200,50],[300,100],[200,200],[250,110]))
	
	//start loop that runs the game
	mainLoopID = setInterval(mainLoop, 1000/fps); //mainLoop function defined in mainLoop.js; mainLoopID is a global variable
}

function endMatch(){
	clearInterval(mainLoopID);
	
	//increment score
	if(tanks.length === 1){ //double checking
		let color = tanks[0].color;
		
		//do a little animation
		let duration = 1000;
		let t_step = 50;
		let t = 0;
		
		let div = scores[color].parentElement;
		
		let id = setInterval(function(){
			if(t >= duration){clearInterval(id)}
						
			//fading yellow background
			div.style.backgroundColor = "rgba(255,255,0,"+(duration-t)/duration+")";
			
			
			t += t_step;
		}, t_step);
		
		//increment the number
		scores[color].innerText = Number(scores[color].innerText) + 1;
	}
	
	
	//pause for a little to change the score and to let the players see it
	setTimeout(startMatch,1500);	
}

