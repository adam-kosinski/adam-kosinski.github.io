function Explosion(x,y,size,duration,flame=false){
	this.x = x;
	this.y = y;
	this.size = size; //size of thing that's exploding; explosion will get larger than this
	this.duration = duration; //in milliseconds
	this.nSmoke = (2/3)*size;
	this.smoke = [];
	this.ti = performance.now();
	
	this.ended = false; //if set to true, the main loop will remove the explosion from the explosions array
	
	//method:
	//generate circles between 0 to 0.5*size radius away from center
	//have them move away from center while expanding and fading
		
	//create smoke circles
	for(let i=0; i<this.nSmoke; i++){
		let angle = 2*Math.PI*Math.random();
		let dist_i = 0.25*size*Math.random();
		let dist_f = size*Math.random() + dist_i;
		
		let xi = dist_i*Math.cos(angle) + this.x;
		let xf = dist_f*Math.cos(angle) + this.x;
		let yi = dist_i*Math.sin(angle) + this.y;
		let yf = dist_f*Math.sin(angle) + this.y;
		this.smoke.push(new Smoke(xi,yi,xf,yf,0.25*size,0.75*size,ctx,flame));
	}
	
	this.draw = function(ctx){
		/*ctx.beginPath()
		ctx.arc(x,y,size,0,2*Math.PI)
		ctx.stroke();*/
		
		let t = performance.now();
		if(t-this.ti > duration){ //both t and duration are in milliseconds
			//explosion ended
			this.ended = true;
		} else {
			//draw smoke
			for(let s=0; s<this.smoke.length; s++){
				this.smoke[s].draw((t-this.ti)/duration);
			}
		}
	}
}

function Smoke(xi,yi,xf,yf,max_start_radius,max_end_radius,ctx,flame=false){
	this.xi = xi;
	this.yi = yi;
	this.xf = xf;
	this.yf = yf;
	this.ri = max_start_radius*Math.random();
	this.rf = (max_end_radius-this.ri)*Math.random() + this.ri;
	
	//color stuff
	this.hsl_i = [0,0,32]; //initial hsl value
	this.hsl_f = [0,0,32]; //final hsl value - will interpolate between these two
	if(flame){
		this.hsl_i = [60*Math.random(),100,50]; //hues from 0 to 60 are red to yellow - fire colors
	}
	this.hsl = this.hsl_i;
	this.getColor = function(alpha=1){
		return "hsla("+this.hsl[0]+","+this.hsl[1]+"%,"+this.hsl[2]+"%,"+alpha+")";
	}
	
	this.draw = function(stage){ //stage is between 0 (start) and 1 (finished), changes linearly with time
		let progress = (stage-1)**3 + 1; //cubic ease out function
		let flame_progress = stage**1.5; //ease in function
			//this is for color interpolation, which is only used to simulate the fire effect, that's why it's called 'flame'
		
		//do interpolation based on value of progress - interpolate linearly with respect to progress
		let x = (this.xf-this.xi)*progress + this.xi;
		let y = (this.yf-this.yi)*progress + this.yi;
		let r = (this.rf-this.ri)*progress + this.ri;
		ctx.globalAlpha = 1-progress;
		this.hsl[0] = (this.hsl_f[0]-this.hsl_i[0])*flame_progress + this.hsl_i[0];
		this.hsl[1] = (this.hsl_f[1]-this.hsl_i[1])*flame_progress + this.hsl_i[1];
		this.hsl[2] = (this.hsl_f[2]-this.hsl_i[2])*flame_progress + this.hsl_i[2];
		
		//create gradient filling for smoke particle
		let gradient = ctx.createRadialGradient(x,y,0,x,y,r);
		gradient.addColorStop(0,this.getColor(1));
		gradient.addColorStop(0.75,this.getColor(0.75));
		gradient.addColorStop(1,this.getColor(0));
		ctx.fillStyle = gradient;
		
		//draw the smoke particle
		ctx.beginPath();
		ctx.arc(x,y,r,0,2*Math.PI);
		ctx.fill();
		
		//reset alpha so other drawings don't get screwed up
		ctx.globalAlpha = 1;
	}
}