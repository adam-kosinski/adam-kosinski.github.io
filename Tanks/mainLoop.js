function mainLoop(){
	//clear canvas
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	//note:
	//the main loop is called fps times a second
	//If I want an object to go d distance a second
	//go d/fps each call: d/fps distance * fps times in a second = d distance in a second
	
	
	//adjust state of tanks
	for(var t = 0; t < tanks.length; t++){
		//rotation
		tanks[t].theta += tanks[t].rotating * tankAngularSpeed/fps;
		
		//movement
		tanks[t].x += tanks[t].moving * tankSpeed/fps * Math.cos(tanks[t].theta);
		tanks[t].y += tanks[t].moving * tankSpeed/fps * Math.sin(tanks[t].theta);
		
		//check for collision with obstacles
		for(let o=0; o<obstacles.length; o++){
			let collision = obstacles[o].detectCollision({type:"polygon", vertices:tanks[t].getHitboxCoords()});
			
			if(collision){
				tanks[t].x += collision.overlap*Math.cos(collision.theta_normal);
				tanks[t].y += collision.overlap*Math.sin(collision.theta_normal);
			}
		}
	}
	
	//adjust state of bullets, checking for collision with walls or tanks (updating tank state if a bullet destroyed a tank)
	for(var b = 0; b < bullets.length; b++){
		let newX = bullets[b].x + bulletSpeed/fps * Math.cos(bullets[b].theta);
		let newY = bullets[b].y + bulletSpeed/fps * Math.sin(bullets[b].theta);
		
		//check for collision with tanks
		let hitTank = false;
		for(var t = 0; t < tanks.length; t++){
			let hitbox = tanks[t].getHitboxCoords();
			if(pointInPolygon([newX, newY], hitbox)){ //pointInPolygon() defined in tests.js
				console.log("HIT TANK",tanks[t]);
				
				//destroy tank
				tanks[t].destroyed = true;
				
				//kill bullet
				bullets[b].dead = true;
				
				//done with this bullet, move on to next bullet
				hitTank = true; //set a flag to be read AFTER the loop ends; if both tanks were in the same place they should both get destroyed
			}
		}
		if(hitTank){continue}
		
		//check for collision with obstacles - will bounce off
		for(var o = 0; o < obstacles.length; o++){
			let b_x = bullets[b].x;
			let b_y = bullets[b].y;
			
			//let collision = obstacles[o].detectLineCollision([[b_x,b_y], [newX, newY]], bullets[b].radius);
			let collision = obstacles[o].detectCollision({type:"circle", radius:bullets[b].radius, center:[newX,newY]});
			
			//console.log(collision);
			
			if(collision){
				//get theta of bullet after bouncing
				bullets[b].theta = collision.theta_normal + angleDiff(bullets[b].theta+Math.PI, collision.theta_normal); //angleDiff() defined in tests.js
				
				//get new location of bullet - shift newX and newY in the direction of theta_normal until there is no more overlap
				newX += collision.overlap*Math.cos(collision.theta_normal);
				newY += collision.overlap*Math.sin(collision.theta_normal);
				
				/*
				//the bullet will travel some of its distance to the obstacle, and the rest away from the obstacle
				let distToCollision = Math.sqrt( (bullets[b].x - collision.point[0])**2 + (bullets[b].y - collision.point[1])**2 )/fps;
				let distAwayFromCollision = bulletSpeed/fps - distToCollision;
				
				//get new x and y of bullet
				bullets[b].x = collision.point[0] + distAwayFromCollision*Math.cos(bullets[b].theta);
				bullets[b].y = collision.point[1] + distAwayFromCollision*Math.sin(bullets[b].theta);
				*/
				//can only collide with one obstacle; stop checking for other obstacles.
				break;
			}
		}
		
		//we're done testing the new x and y for collisions, so now set them
		bullets[b].x = newX;
		bullets[b].y = newY;
	}
	
	//draw obstacles
	for(var o = 0; o < obstacles.length; o++){
		obstacles[o].draw(ctx);
	}
	
	//draw bullets, check for dead ones
	for(var b = 0; b < bullets.length; b++){
		if(bullets[b].dead === true){
			//delete the bullet from the program's memory
			bullets.splice(b,1);
			b--;
		}
		else {
			bullets[b].draw(ctx);
		}
	}
	
	//draw tanks, check for destroyed ones
	for(var t = 0; t < tanks.length; t++){
		if(tanks[t].destroyed === true){
			//start tankHitTimer (global variable)
			if(tankHitTimer === undefined){
				tankHitTimer = 0;
			}
			//delete the tank from the program's memory
			tanks.splice(t,1);
			t--;
		}
		else {
			tanks[t].draw(ctx);
		}
	}
	
	//increment tankHitTimer if it's been started
	if(tankHitTimer !== undefined){
		tankHitTimer += 1000/fps;
	}
}