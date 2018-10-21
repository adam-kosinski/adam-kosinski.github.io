function drawIsometric(canvas,item){ //item ('thing to draw') is a 3d array in 'solution notation' - "p#" means draw a cube of the part with partNum=#, "_#" means don't draw
	//draw solution outline first (if want to)
	//draw lowest tier first cube-by-cube, in order of cubes furthest back (back row, middle row, front row, and back col, middle col, front col within each row)
	//draw next highest tier the same way, etc.
	//the most recent cube drawn will overlap and hide all cubes drawn before it
	
	console.log("Drawing Isometric...");
	
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,canvas.width,canvas.height); //for redraw stuff, such as if toggling part visibility
	
	ctx.lineWidth = 3;
	ctx.lineCap = "round";
	
	//find middle of canvas
	var cX = Math.floor(canvas.width / 2);
	var cY = Math.floor(canvas.height / 2);
	
	//iterate through 'item' in proper order, drawing one cube at a time
	var nTiers = item.length;
	var nRows = item[0].length;
	var nCols = item[0][0].length;
	
	for(var t=nTiers-1; t>=0; t--){ //iterate the other way than usual through tiers (bottom to top)
		for(var r=0; r<nRows; r++){
			for(var c=0; c<nCols; c++){
				var cell = String(item[t][r][c]);
				if(cell[0] === "p"){ //if I don't want to draw it, I would've flagged the cube as '_partNum'
					var partNum = Number(cell.slice(1)); //cell format is 'p2' for example; 2 is the part that the cell belongs to
					var color = partsInfo[partNum].color;
					drawCube(ctx,c,nTiers-1-t,r,cX,cY,color);
				}
			}
		}
	}
	console.log("Finished Drawing!");
}

function getGridPoint(x,y,z,cX,cY){ //x,y,z here are item offset coords, using the cartesian system (e.g. corner farthest from viewer is 0,0,0); cX and cY are canvas coords
	//variables that will store offset from center for now, then later return value (all in canvas-coords)
	var X = 0;
	var Y = 0;
	
	//get x and y offset
	X = isoCubeSideLength*( x*(Math.sqrt(3)/2) + z*(-Math.sqrt(3)/2) ); //to get x-offset, find x*cos(-pi/6) + z*cos(5pi/6); angles correspond to axis direction
	Y = isoCubeSideLength*( -y + x*0.5 + z*0.5); //to get y-offset, find -y (cartesian system) + x*sin(pi/6) + z*sin(pi/6); sin values/angles are positive b/c positive x or z means positive y-offset
	
	//offset from center and find coords
	X += cX;
	Y += cY;
	
	return [X,Y];
}

//draw cube called by draw isometric
function drawCube(ctx,x,y,z,cX,cY,color){ //x,y,z here are item offset coords, using the cartesian system (e.g. corner farthest from viewer is 0,0,0); cX and cY are canvas coords
	//define some shorthand
	var g = function(xOffset,yOffset,zOffset){
		return getGridPoint(x+xOffset,y+yOffset,z+zOffset,cX,cY);
	}
	var p; //used to temporarily store point coords gotten from g()
	
	//process color to allow shadows and tints
	var rgb = {
		r : hexToNum(color.substring(1,3)),
		b : hexToNum(color.substring(3,5)),
		g : hexToNum(color.substring(5,7))
	}
	var lrgb = { //light rgb
		r : String(rgb.r + (256-rgb.r)*.25),
		b : String(rgb.b + (256-rgb.b)*.25),
		g : String(rgb.g + (256-rgb.g)*.25)
	}
	var drgb = { //dark rgb
		r : String(rgb.r * .75),
		b : String(rgb.b * .75),
		g : String(rgb.g * .75)
	}	
	
	//draw top face
		//light color for top face
	ctx.fillStyle = "rgb("+lrgb.r+","+lrgb.b+","+lrgb.g+")";
	//outline it starting at middle of total cube and going clockwise
	ctx.beginPath();
		p = g(0,0,0);
	ctx.moveTo(p[0],p[1]);
		p = g(0,0,-1);
	ctx.lineTo(p[0],p[1]);
		p = g(0,1,0);
	ctx.lineTo(p[0],p[1]);
		p = g(-1,0,0);
	ctx.lineTo(p[0],p[1]);
	ctx.closePath();
	//fill and stroke it
	ctx.fill();
	ctx.stroke();
	
	//draw left-bottom face
		//normal color for left-bottom face
	ctx.fillStyle = color;
	//outline it starting at middle of total cube and going clockwise
	ctx.beginPath();
		p = g(0,0,0);
	ctx.moveTo(p[0],p[1]);
		p = g(0,-1,0);
	ctx.lineTo(p[0],p[1]);
		p = g(0,0,1);
	ctx.lineTo(p[0],p[1]);
		p = g(-1,0,0);
	ctx.lineTo(p[0],p[1]);
	ctx.closePath();
	//fill and stroke it
	ctx.fill();
	ctx.stroke();
	
	//draw right-bottom face
			//dark color for right-bottom face
	ctx.fillStyle = "rgb("+drgb.r+","+drgb.b+","+drgb.g+")";
	//outline it starting at middle of total cube and going clockwise
	ctx.beginPath();
		p = g(0,0,0);
	ctx.moveTo(p[0],p[1]);
		p = g(0,-1,0);
	ctx.lineTo(p[0],p[1]);
		p = g(1,0,0);
	ctx.lineTo(p[0],p[1]);
		p = g(0,0,-1);
	ctx.lineTo(p[0],p[1]);
	ctx.closePath();
	//fill and stroke it
	ctx.fill();
	ctx.stroke();
}