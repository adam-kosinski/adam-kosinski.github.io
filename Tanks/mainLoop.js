let t_prev = 0;
function mainLoop(){	
	//clear canvas
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	//note:
	//the main loop is called fps times a second
	//If I want an object to go d distance a second
	//go d/fps each call: d/fps distance * fps times in a second = d distance in a second
	
	//adjust state of obstacles, only for fun version
	if(fun_version){
		for(let o = 0; o < obstacles.length; o++){
			obstacles[o].updatePosition();
		}
	}
	
	//rotating obstacles
	/*
	let cx = 250;
	let cy = 250;
	let v_ang = 0.05*Math.PI;
	for(let o=0; o<obstacles.length; o++){
		for(let v=0; v<obstacles[o].vertices.length; v++){
			if(obstacles[o].fun_version_disabled){continue}
			let vertex = obstacles[o].vertices[v];
			let dx = vertex[0]-cx;
			let dy = vertex[1]-cy;
			let d = Math.sqrt(dx**2 + dy**2);
			let theta = dy<0 ? -Math.acos(dx/d) : Math.acos(dx/d);
			theta += v_ang/fps;
			vertex[0] = cx+d*Math.cos(theta);
			vertex[1] = cy+d*Math.sin(theta);

		}
	}
	*/
	
	//adjust state of tanks
	for(let t = 0; t < tanks.length; t++){
		//rotation
		tanks[t].theta += tanks[t].rotating * tankAngularSpeed/fps;
		
		//movement
		tanks[t].x += tanks[t].moving * tankSpeed/fps * Math.cos(tanks[t].theta);
		tanks[t].y += tanks[t].moving * tankSpeed/fps * Math.sin(tanks[t].theta);
		
		//check for collision with obstacles
		for(let o=0; o<obstacles.length; o++){
			
			//check for collision with tank body
			let collision = obstacles[o].detectCollision({type:"polygon", vertices:tanks[t].getHitboxCoords("body")});
			if(collision){
				tanks[t].x += collision.overlap*Math.cos(collision.theta_normal);
				tanks[t].y += collision.overlap*Math.sin(collision.theta_normal);
			}
			
			//check for collision with tank nozzle
			collision = obstacles[o].detectCollision({type:"polygon", vertices:tanks[t].getHitboxCoords("nozzle")});
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
	
	/*let time = Math.floor(performance.now()/1000);
	if(time !== t_prev){
		let i = Math.floor(Math.random()*4);
		let bul;
		switch(i){
			case 0: bul = new Bullet(5,5,2*Math.PI*Math.random());break;
			case 1: bul = new Bullet(canvas.width-5,5,2*Math.PI*Math.random());break;
			case 2: bul = new Bullet(canvas.width-5,canvas.height-5,2*Math.PI*Math.random());break;
			case 3: bul = new Bullet(5,canvas.height-5,2*Math.PI*Math.random());break;
		}
		setTimeout(function(){bul.dead = true},bulletLife);
		bullets.push(bul);
		t_prev= time;
	}*/
	
	
	//draw bullets, check for dead ones
	for(var b = 0; b < bullets.length; b++){
		if(bullets[b].dead === true){
			//create a non-fiery explosion there
			explosions.push(new Explosion(bullets[b].x, bullets[b].y, bullets[b].radius*2, 1500));
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
			tankHitTimer = 0; //we want a delay after the first tank explodes, but also after the second one does if both are hit, to let the animation play
			
			//create an fiery explosion there
			explosions.push(new Explosion(tanks[t].x, tanks[t].y, tanks[t].length, 1500, true));
			
			//delete the tank from the program's memory
			tanks.splice(t,1);
			t--;
		}
		else {
			tanks[t].draw(ctx);
		}
	}
	
	//draw explosions
	for(let e = 0; e < explosions.length; e++){
		if(explosions[e].ended === true){
			explosions.splice(e,1);
			e--
		}
		else {
			explosions[e].draw(ctx);
		}
	}
	
	//increment tankHitTimer if it's been started
	if(tankHitTimer !== undefined){
		tankHitTimer += 1000/fps;
	}
	
	//check if game ended
	if(tankHitTimer > tankHitTimerTimeout){
		//note: tankHitTimer is reset to 0 after any tank explodes (i.e. will cause a display even after all tanks explode, to let the animation finish)
		
		tankHitTimer = undefined;
		endMatch(); //see match.js
	}
}