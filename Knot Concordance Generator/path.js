/*Class to store how the added band is woven throughout the knot.
Method of storage will be:
	- location of start loop
	- location of steps
	- over/under for each step
*/
class Path {
	constructor(start_x, start_y){
		this.start_x = start_x;
		this.start_y = start_y;
		this.steps = [];
		this.merge_left_p = undefined; //band merges at this point, left point if traveling along the band
		this.merge_right_p = undefined; //band merges at this point, right point if traveling along the band
	}
	addStep(x,y,over){
		if(over == undefined){console.log("You forgot to specify the 'over' arg in addStep(), doofus"); return;}
		let new_step = new Step(x,y,over);
		this.steps.push(new_step);
		return new_step;
	}
}

class Step {
	constructor(x,y,over){
		this.x = x;
		this.y = y;
		this.over = over;
	}
}


function generatePath(state){ //returns the randomly-generated path
	let path = new Path(50,200);
	let last_step = path.addStep(50 + 0.5*LOOP_WIDTH + 2*BAND_WIDTH, 200, true); //add some stuff to x to put the first step just right of the loop
	let last_angle = 0;
	
	let used_strands = [];
	
	//add new step
	for(let i=0; i<5; i++){
		/*
		let dist = 2*BAND_WIDTH + 3*BAND_WIDTH*(Math.random()+Math.random());
		let angle_range = 1.5*Math.PI;
		let angle = angle_range*Math.random() - 0.5*angle_range + last_angle;
		let vector = {
			x: dist*Math.cos(angle),
			y: dist*Math.sin(angle)
		}
		
		let x = last_step.x + vector.x;
		let y = last_step.y + vector.y;
		
		if(x < 0 || 500 < x || y < 0 || 500 < y){
			continue;
		}
		*/
		let over = Math.random() > 0.5 ? true : false;
		
		let strand = selectRandomStrand(state, 2*BAND_WIDTH);
		let x = strand.p0.x + 0.5*strand.length*strand.unit.x;
		let y = strand.p0.y + 0.5*strand.length*strand.unit.y;
		
		
		if(used_strands.indexOf(strand) == -1){
			last_step = path.addStep(x, y, over);
		}
				used_strands.push(strand);

		//last_angle = angle;
	}
	
	let merge_strand = selectRandomStrand(state, 2*BAND_WIDTH);
	if(!merge_strand){return false;}
	
	let gap_points = state.openGap(merge_strand);
	
	path.merge_left_p = gap_points[0];
	path.merge_right_p = gap_points[1];
	
	return path;
}

function selectRandomStrand(state, min_length){
	let strand;
	let tries = 0;
	do {
		strand = state.strands[Math.floor(Math.random()*state.strands.length)];
		if(tries > 200){
			console.log("selectRandomStrand() couldn't find a strand long enough");
			return false;
		}
		tries++;
	} while(strand.length < min_length);
	
	return strand;
}