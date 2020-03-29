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
	state.updateRegions();
	
	let path = new Path(50,200);
	let last_step = path.addStep(50 + 0.5*LOOP_WIDTH + 2*BAND_WIDTH, 200, true); //add some stuff to x to put the first step just right of the loop
	
	let current_region;
	for(let i=0; i<state.regions.length; i++){
		if(state.regions[i].isOuter()){
			current_region = state.regions[i];
		}
	}
	if(!current_region){throw new Error("couldn't find outer region");}
	
	let prev_r2_strand;
	
	for(let n=0; n<3; n++){
		//get strand to reid 2 over/under
		let options = {r2_valid: true};
		if(n > 0){options.exclude = [prev_r2_strand]}
		let strand_to_r2 = current_region.getRandomStrand(options);
		
		let over = Math.random() > 0.5 ? true : false;
		
		//go to the first r2 point
		let r2_p0 = current_region.getR2Point(strand_to_r2);
		path.addStep(r2_p0.x, r2_p0.y, false);
		
		//go to the second r2 point
		let other_region = (current_region === strand_to_r2.regions[0] ? strand_to_r2.regions[1] : strand_to_r2.regions[0]);
		r2_p1 = other_region.getR2Point(strand_to_r2);
		path.addStep(r2_p1.x, r2_p1.y, over);
		
		//reset for next reid 2
		prev_r2_strand = strand_to_r2;
		current_region = other_region;
	}
	
	//merge
	let options = {
		exclude: [prev_r2_strand],
		min_length: 1.5*BAND_WIDTH
	};
	let merge_strand = current_region.getRandomStrand(options);
	if(!merge_strand){throw new Error("couldn't find a merge strand")}
	
	let gap_points = state.openGap(merge_strand);
	
	path.merge_left_p = gap_points[0];
	path.merge_right_p = gap_points[1];
	
	return path;
	
	
	
	
	
	
	if(false){
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