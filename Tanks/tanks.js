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
	this.nozzleWidth = 0.3*this.width;
	this.nozzleLength = this.length/2 + tankNozzleExtension; //tankNozzleExtension is a global config value
	
	//other information
	this.n_bullets = nBullets; //global config
	this.destroyed = false; //when set to true, the mainLoop will delete the tank and create an explosion to animate the tank's destruction
	this.moving = 0; //alternate values: 1 (forward) or -1 (backward)
	this.rotating = 0; //alternate values: 1 (clockwise) or -1 (counterclockwise)
		//note: to calculate rotation, mainLoop.js will multiply this.rotating by angular speed and add that to theta
		//however, b/c of canvas coordinates, counterclockwise rotation in math will appear like clockwise rotation on the canvas
	
	//generate score display
	if(!score_display_generated){
		let score_td = document.createElement("td");
		let score_div = document.createElement("div");
		let icon = generateTankIcon(this.color);
		let score = document.createElement("p");
		score.innerText = "0";
		scores[color] = score; //scores is a global object
		score_div.appendChild(icon);
		score_div.appendChild(score);
		score_td.appendChild(score_div);
		score_tr.appendChild(score_td); //score_tr is a global reference
	}
	
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
		let newBullet = new Bullet(b_x, b_y, this.theta);
		bullets.push(newBullet);
		
		//set timeout for bullet to go away, and for this tank to get an extra bullet
		setTimeout(function(){
			newBullet.dead = true;
			this.n_bullets++;
		}.bind(this), bulletLife); //.bind(this) required so the function's this object is this tank; bulletLife is a global config variable
		
		console.log("firebullet",this,bullets);
	}
	
	this.getHitboxCoords = function(part="body"){ //part can be "body" or "nozzle"
		//variables to describe a rectangle to get coords of corners
		let width;
		let length;
		let center_x;
		let center_y;
		
		if(part === "body"){
			width = this.width;
			length = this.length;
			center_x = this.x;
			center_y = this.y;
		}
		else if(part === "nozzle"){
			width = this.nozzleWidth;
			length = this.nozzleLength;
			center_x = this.x + (this.nozzleLength/2)*Math.cos(this.theta);
			center_y = this.y + (this.nozzleLength/2)*Math.sin(this.theta);
		}
		else {
			throw new Error("invalid argument to Tank.getHitboxCoords()");
		}
		
		let radius = Math.sqrt((width/2)*(width/2) + (length/2)*(length/2));
		let ang = Math.atan(width/length); //angle from horizontal that each of the vertices are, ang will be between 0 and pi/2
		
		//get rotated angles of the 4 vertices
		let angles = [
			[ang + this.theta],
			[(Math.PI-ang) + this.theta],
			[(Math.PI+ang) + this.theta],
			[-ang + this.theta]
		];
		
		let vertices = [];
		for(var i=0; i<4; i++){
			vertices.push([radius*Math.cos(angles[i]) + center_x, radius*Math.sin(angles[i]) + center_y]);
		}
		
		return vertices;
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
		ctx.fillRect(0, -0.5*this.nozzleWidth, this.nozzleLength, this.nozzleWidth); //tankNozzleExtension is a global config value
		ctx.strokeRect(0, -0.5*this.nozzleWidth, this.nozzleLength, this.nozzleWidth);
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
			//NOTE: the .bind(this) is required so the function uses this Tank as its this, not the caller's this
	}
}


//function to generate a tank icon of the right color that will sit next to the player's score
//returns a img html element
function generateTankIcon(color){
	
	let img = document.createElement("img");
	img.src = "tank.png";
	img.width = tankIconWidth;
	
	let hue = colorToHsl(color)[0] * 360; //see function below
	img.style.filter = "hue-rotate("+hue+"deg)";
	
	return img;
}

function colorToHsl(color){
	//stolen from stack overflow - returns hsl in the set [0,1]
	var rgbToHsl = function(r, g, b){
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}else{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return [h, s, l];
	}
	
	//draw color on canvas to convert to rgb, plug into top function
	let off_canvas = document.createElement("canvas");
	let off_ctx = off_canvas.getContext("2d");
	off_ctx.fillStyle = color;
	off_ctx.fillRect(0,0,off_canvas.width,off_canvas.height);
	let data = off_ctx.getImageData(0,0,1,1).data;
	let r = data[0];
	let g = data[1];
	let b = data[2];
	return rgbToHsl(r,g,b);
}