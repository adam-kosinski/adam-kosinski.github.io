
function drawSword(x,y,theta){ //theta is angle counterclockwise from up
	
	ctx.translate(x,y);
	ctx.rotate(-theta); //negative to rotate counterclockwise theta radians
	ctx.fillRect(-5,-200,10,230); //blade and hilt
	ctx.fillRect(-25,-5,50,10); //guard
	ctx.rotate(theta);
	ctx.translate(-x,-y);
}


function drawExtra(){
	
	ctx.lineWidth = 2;
	line(x_min,0,x_min,canvas.height);
	line(x_max,0,x_max,canvas.height);
	line(0,y_min,canvas.width,y_min);
	line(0,y_max,canvas.width,y_max);
	
	ctx.fillStyle = "lightgray";
	ctx.fillRect(x_min,y_min,x_max-x_min,y_max-y_min);
	ctx.fillStyle = "black";
	
	ctx.strokeStyle = "red";
	ctx.lineWidth = 1;
	line(x_left,0,x_left,canvas.height);
	line(x_right,0,x_right,canvas.height);
	line(0,y_low,canvas.width,y_low);
	line(0,y_high,canvas.width,y_high);
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1;
}

function line(x1,y1,x2,y2){
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}


function get_out_theta(x,y){ //x,y with respect to center point (x_center, y_low)
	
	//get theta pointing sword away from center point
	let dist_from_center = Math.sqrt( x**2 + y**2 );
	let theta = y > 0 ? Math.acos(x/dist_from_center) : -Math.acos(x/dist_from_center);
	
	return theta - 0.5*Math.PI; //switch to angle from vertical
}

function get_center_theta(x,y){ //x,y with respect to center point (x_center, y_low)
	/*/method:
	//use a sine function with its period being the x-range between x_left and x_right
	//get max angle offset based on y (positive value)
	//scale the offset by the sine function output, that's the output theta
	
	console.log( Math.sin( 2*Math.PI * x / (x_right-x_left) ) );
	
	let max_angle_offset = y * ( 0.5*Math.PI / (y_low-y_high) ); // pi/2 when at top of center region
	return max_angle_offset * Math.sin( 2*Math.PI * x / (x_right-x_left) );
	*/
	
	return 0;
}

//function to get base angle of sword
function getBaseSwordAngle(x,y){ //x,y with respect to on guard point (x_right, y_low)
	
	//sword gets more horizontal further horizontally from on guard position
	let base_angle_offset = -Math.atan(x/100);
	
	//sword doesn't really start rotating until past the left/right x-bounds (equate to sides of body)
	//using function 1 - 1/(1+u^4)
	let u = 1 * (x+x_right-x_center) / (x_right - x_left); //2 * signed distance from center, scaled so -1<u<1 is x_left<x<x_right
	let scalar = 1 - 1/(1 + u**4);
	
	return scalar * base_angle_offset;
}

//function to get angle of sword taking parry 5 into account
function getSwordAngle(x,y){ //x,y with respect to on guard point (x_right, y_low)	
	//parry 5 is theta=pi/2
	
	//the closer y is to y_high, and the closer x is to being between x_left and x_right,
	//the more parry 5 is weighted in comparison to base sword angle
	
	let dy = y - (y_low - y_high); //positive if y is above y_high visually
	let dx = x + x_right - x_center;
	
	//use 1/1+x^2 function to generate a weight for the parry 5 angle
	
	let max_weight = 20;
	
	//define distances of influence from (x_center, y_high) - farther away, parry 5 will be weighted very little
	let y_dist_of_influence = 50; //in px
	let x_dist_of_influence = x_right - x_left; //in px
	
	let weight = max_weight/(1 + (dy/y_dist_of_influence)**4 + (dx/x_dist_of_influence)**4);
	//weight of base sword angle will be 1
		
	//get weighted average
	return (weight*(Math.PI/2) + getBaseSwordAngle(x,y)) / (weight + 1);
}