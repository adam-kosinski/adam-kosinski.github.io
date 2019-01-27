function Tank(x,y,theta,color,keyControls){
	//x and y are coords of center of tank
	//keyControls is of format: {moveForward:"key", moveBackward:"key", rotateClockwise:"key", rotateCounterclockwise:"key", fireBullet:"key"}
	
	//position variables
	this.x = x;
	this.y = y;
	this.theta = theta; //in radians
	
	//display variables
	this.color = color;
	this.width = tankWidth; //global config value
	this.length = tankLength; //global config value (not overriding anything by the way)
		//note: length is the forward-backward direction
	
	//other information
	this.n_bullets = 5;
	this.destroyed = false; //when set to true, the mainLoop will delete the tank and create an explosion to animate the tank's destruction
	this.moving = 0; //alternate values: 1 (forward) or -1 (backward)
	this.rotating = 0; //alternate values: 1 (clockwise) or -1 (counterclockwise)
		//note: to calculate rotation, mainLoop.js will multiply this.rotating by angular speed and add that to theta
		//however, b/c of canvas coordinates, counterclockwise rotation in math will appear like clockwise rotation on the canvas
	
	//methods
	this.moveForward = function(){this.moving = 1; console.log("moving",this,this.moving)}
	this.moveBackward = function(){this.moving = -1; console.log("moving",this,this.moving)}
	this.stopMoving = function(){this.moving = 0; console.log("moving",this,this.moving)}
	
	this.rotateClockwise = function(){this.rotating = 1; console.log("rotating",this,this.rotating)}
	this.rotateCounterclockwise = function(){this.rotating = -1; console.log("rotating",this,this.rotating)}
	this.stopRotating = function(){this.rotating = 0; console.log("rotating",this,this.rotating)}
	
	this.fireBullet = function(){
		if(this.n_bullets <= 0 || this.destroyed){return}
		
		//the front edge of the bullet will appear at the tip of the tank's nozzle (to avoid the bug of firing through walls)
		let b_x = this.x + (this.length/2 + tankNozzleExtension-bulletRadius) * Math.cos(this.theta); //tankNozzleExtension is a global config value
		let b_y = this.y + (this.length/2 + tankNozzleExtension-bulletRadius) * Math.sin(this.theta);
		
		//decrement bullets stored in this tank
		this.n_bullets--;
		
		//fire bullet
		let newBullet = new Bullet(b_x, b_y, this.theta, this);
		bullets.push(newBullet);
		
		//set timeout for bullet to go away, and for this tank to get an extra bullet
		setTimeout(function(){
			newBullet.dead = true;
			this.n_bullets++;
		}.bind(this), bulletLife); //.bind(this) required so the function's this object is this tank; bulletLife is a global config variable
		
		console.log("firebullet",this,bullets);
	}
	
	this.getHitboxCoords = function(nozzleToo=false){ //if nozzleToo is true, return the 2 coordinates of the tip of the nozzle as well
		return getRectCoords(this.x, this.y, this.width, this.length, this.theta); //function in tests.js
	}
	
	this.draw = function(ctx){
		//modify drawing context
		ctx.translate(this.x, this.y);
		ctx.rotate(this.theta);
		
		//draw tank
		ctx.fillStyle = this.color;
		ctx.strokeStyle = "black";
		//base
		ctx.fillRect(-this.length/2, -this.width/2, this.length, this.width);
		ctx.strokeRect(-this.length/2, -this.width/2, this.length, this.width);
		//nozzle
		ctx.beginPath();
		ctx.fillRect(0, -0.15*this.width, this.length/2 + tankNozzleExtension, 0.3*this.width); //tankNozzleExtension is a global config value
		ctx.strokeRect(0, -0.15*this.width, this.length/2 + tankNozzleExtension, 0.3*this.width);
		//cabin (circle)
		ctx.beginPath();
		ctx.arc(0, 0, 0.375*this.width, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
		
		//reset drawing context
		ctx.rotate(-this.theta);
		ctx.translate(-this.x, -this.y);
	}
	
	//bind key events to methods
	for(prop in keyControls){
		let key = keyControls[prop];
		
		//determine which function to call upon keyup; NOTE: the name of prop is the function to call on keydown
		let keyupFunction;
		if(prop === "moveForward" || prop === "moveBackward"){keyupFunction = this.stopMoving}
		else if(prop === "rotateClockwise" || prop === "rotateCounterclockwise"){keyupFunction = this.stopRotating}
		else {keyupFunction = function(){}} //empty function otherwise
		
		//apply binding - keyConfig is defined in globals.js, and the functions in it are called in events.js
		keyConfig[key] = {keydown:this[prop].bind(this), keyup:keyupFunction.bind(this), prevEvent:undefined}
			//NOTE: the .bind(this) is required so the function uses this Tank as its this, not the caller's this (the object we define here)
	}
}