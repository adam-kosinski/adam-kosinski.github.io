function Bullet(x,y,theta){ //shooter is the Tank object that shot the bullet
	//position and direction
	this.x = x;
	this.y = y;
	this.theta = theta;
	this.radius = bulletRadius; //global config value
		
	this.dead = false; //when set to true, the mainLoop will delete the bullet and create a small explosion to animate the bullet's death
	
	//methods
	this.draw = function(ctx){
		ctx.fillStyle = "DimGray";
		ctx.strokeStyle = "black";
		
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
}