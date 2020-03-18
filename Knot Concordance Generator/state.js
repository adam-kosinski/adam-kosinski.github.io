class State {
	//WARNING: ANY MODIFICATIONS TO MEMBER VARIABLES NEED TO BE UPDATED IN getCopy() METHOD
	
	constructor(){
		this.points = [];
		this.strands = [];
		this.ordered_indices = []; //the function IDStrands() below will fill this with strand indices in order of ID
	}
	
	newPoint(x,y){
		let p = new Point(x,y);
		this.points.push(p);
		return p;
	}
	
	//add a new strand to the state, does intersection checking. Doesn't return the strand, since it might split into multiple
	newStrand(p0, p1, over=true, p0_over=true, p1_over=true){ //third arg is if this strand should go over existing ones by default
		let new_strand = new Strand(p0,p1,p0_over,p1_over);
		
		//intersection checking
		for(let s=0; s<this.strands.length; s++){
			let other_strand = this.strands[s];
			
			//if the strand is connected to either of the new strand's points, don't check for intersection - there won't be a meaningful one and it will cause a false intersection to be detected at the new strand's points
			if(p0.strands.indexOf(other_strand) !== -1 || p1.strands.indexOf(other_strand) !== -1){
				continue;
			}
			
			let intersection = intersect(new_strand, other_strand);
			if(intersection){
				
				//remove the other strand so it can be replaced
				this.removeStrand(other_strand);
				//disconnect the new strand we just made. Don't need to fully remove it b/c wasn't yet pushed to this.strands
				new_strand.disconnect();

				//add the intersection point to points
				this.points.push(intersection);
				
				//split this strand and the other strand in two				
				//this strand
				this.newStrand(p0, intersection, over, p0_over, over); //preserve over/under at non-intersection points, set it at intersection points based on "over" arg
				this.newStrand(intersection, p1, over, over, p1_over);
				//other strand
				this.newStrand(other_strand.p0, intersection, true, other_strand.p0_over, !over); //args follow same logic as for new strand, except we assume over is true (shouldn't matter really since no cascading intersections for this one)
				this.newStrand(intersection, other_strand.p1, true, !over, other_strand.p1_over);
				
				return; //other intersections will be taken care of by the recursive calls for new strands
			}
		}
		
		//if no intersections, push this strand
		this.strands.push(new_strand);
	}
	
	removeStrand(strand){
		//remove strand from this state's strands array
		let idx = this.strands.indexOf(strand);
		if(idx == -1){
			console.log("Couldn't remove strand b/c couldn't find it in state's strands array");
			return;
		}
		this.strands.splice(idx, 1);
		
		//disconnect it from its points
		strand.disconnect();
	}
	
	openGap(strand){ //returns array of the two new points created by the gap
		let mid_x = strand.p0.x + strand.unit.x * 0.5*strand.length;
		let mid_y = strand.p0.y + strand.unit.y * 0.5*strand.length;
		let p0_side_point = this.newPoint(mid_x - strand.unit.x*0.5*BAND_WIDTH, mid_y - strand.unit.y*0.5*BAND_WIDTH);
		let p1_side_point = this.newPoint(mid_x + strand.unit.x*0.5*BAND_WIDTH, mid_y + strand.unit.y*0.5*BAND_WIDTH);
		p0_side_point.endpoint = true;
		p1_side_point.endpoint = true;
		
		this.removeStrand(strand);
		
		this.newStrand(strand.p0, p0_side_point);
		this.newStrand(p1_side_point, strand.p1);
		
		return [p0_side_point, p1_side_point];
	}
	
	orientStrands(){
		//note: logic looks a lot like the IDStrands() function below
		let strand_indices = Array.from(Array(this.strands.length).keys()); //keeps track of stuff not yet oriented
		
		//sort and put endpoints first
		this.strands.sort(function(a,b){
			if(a.p0.endpoint && !b.p0.endpoint){return -1;} //first sort for endpoints that are a p0
			else if(b.p0.endpoint && !a.p0.endpoint){return 1;}
			else if(a.p1.endpoint && !b.p1.endpoint){return -1;} //now sort for any strands with an endpoint
			else if(b.p1.endpoint && !a.p1.endpoint){return 1;}
			else {return 0;} //if no endpoint differences, keep order the same
		});
		
		while(strand_indices.length > 0){ //loop for going through multiple components	
			let i = strand_indices[0]; //current strand index
			let first_strand = this.strands[i];
			//make sure if we start with an endpoint, it's going into the knot, so that getNextStrand() will work for us properly
			if(first_strand.p1.endpoint){
				first_strand.flipOrientation();
			}
			
			let next_strand; //declared in this scope so the do-while loop's condition can read it
			
			do {
				//this.strands[i].show();
				//debugger;
				
				//if we got to this strand, its orientation was already good, so mark that
				strand_indices.splice(strand_indices.indexOf(i), 1)[0];
				
				//orient next strand to have same orientation as this strand
				next_strand = this.strands[i].getNextStrand();
				if(next_strand == false){break;} //reached an endpoint, no next strand exists, so we're done w/ this component
				if(next_strand.p0 != this.strands[i].p1){
					next_strand.flipOrientation();
				}
				
				i = this.strands.indexOf(next_strand);
				
			} while (next_strand != first_strand && strand_indices.length > 0)
		}
	}
	
	//function to assign strands IDs in order
	IDStrands(){
		let cur_id = 1;
		let strand_indices = Array.from(Array(this.strands.length).keys()); //gets an array [0,1,2,3, ...]
		//this array is used to track what strands remain to be ID-ed. Strands w/ an ID get removed. The entry in the
		//array refers to the strand's index in this.strands
		
		this.ordered_indices = [];
		
		//sort this.strands so that strands w/ crossings at p0 come first, since we always need to start ID-ing each component
		//at a strand that just came out of a crossing
		this.strands.sort(function(a,b){
			if(a.p0.isCrossing() && !b.p0.isCrossing()){return -1;}
			else if(b.p0.isCrossing() && !a.p0.isCrossing()){return 1;}
			else {return 0;}
		});
		
		//clear old IDs
		for(let i=0; i<this.strands.length; i++){
			this.strands[i].id = undefined;
		}
		
		while(strand_indices.length > 0){ //loop for going through multiple components
			let i = strand_indices[0]; //current strand index
			let first_strand = this.strands[i];
			let next_strand; //declared in this scope so the do-while loop's condition can read it
			
			do {
				this.strands[i].id = cur_id;
				let done_idx = strand_indices.splice(strand_indices.indexOf(i), 1)[0];
				this.ordered_indices.push(done_idx);
				
				if(this.strands[i].p1.isCrossing()){cur_id++;} //only change id at a crossing
				next_strand = this.strands[i].getNextStrand();
				if(next_strand == false){break;} //reached an endpoint, no next strand exists, so we're done w/ this component
				i = this.strands.indexOf(next_strand);
				
			} while (next_strand != first_strand  && strand_indices.length > 0)
		}
	}
	
	getPD(){		
		this.IDStrands();
		
		//loop through strands in order, if come to a strand going under into a crossing, get the code of that crossing
		let PD = [];
		for(let i=0; i<this.ordered_indices.length; i++){
			let strand = this.strands[this.ordered_indices[i]];
			
			if(strand.p1_over == false){
				PD.push(strand.p1.getPD(strand));
			}
		}
		
		//turn PD code into a string and return it
		let out = "PD[";
		for(let i=0; i<PD.length; i++){
			out += "X";
			out += JSON.stringify(PD[i]);
			if(i < PD.length-1){out += ",";}
		}
		out += "]";
		
		return out;
	}
	
	//function to add points/strands corresponding to a given added-band path
	applyPath(path){
		//will have to re-orient later anyways so orientation of strands here doesn't really matter
		
		//add the starting loop
		let top_left = this.newPoint(path.start_x - 0.5*LOOP_WIDTH, path.start_y - 0.5*LOOP_HEIGHT);
		let top_right = this.newPoint(path.start_x + 0.5*LOOP_WIDTH, path.start_y - 0.5*LOOP_HEIGHT);
		let bottom_left = this.newPoint(path.start_x - 0.5*LOOP_WIDTH, path.start_y + 0.5*LOOP_HEIGHT);
		let bottom_right = this.newPoint(path.start_x + 0.5*LOOP_WIDTH, path.start_y + 0.5*LOOP_HEIGHT);
		
		let hole_top = this.newPoint(path.start_x + 0.5*LOOP_WIDTH, path.start_y - 0.5*BAND_WIDTH);
		let hole_bottom = this.newPoint(path.start_x + 0.5*LOOP_WIDTH, path.start_y + 0.5*BAND_WIDTH);
		
		this.newStrand(hole_top, top_right);
		this.newStrand(top_right, top_left);
		this.newStrand(top_left, bottom_left);
		this.newStrand(bottom_left, bottom_right);
		this.newStrand(bottom_right, hole_bottom);
		
		let prev = new Point(path.start_x + 0.5*LOOP_WIDTH, path.start_y); //using the Point class for convenient storage of x,y
		let prev_prev;
		let prev_left_p = hole_top; //previous point along the strand, to the left as you're facing forward on the strand (away from the loop)
		let prev_right_p = hole_bottom; //same but to the right
		
		//loop through the steps, adding points and strands to form the band
		for(let s=0; s<=path.steps.length; s++){ // '<=' not '<' so we can use the pretty-turn logic for the merge bit
			let step;
			if(s < path.steps.length){
				step = path.steps[s];
			}
			else {
				step = { //average of the merge points
					x: (path.merge_left_p.x + path.merge_right_p.x)/2,
					y: (path.merge_left_p.y + path.merge_right_p.y)/2,
					over: true
				}
			}
			
			//get vector from previous point, so we can draw next points perpendicular to it, from the current step's x/y
			let from_prev = {
				x: (step.x - prev.x),
				y: (step.y - prev.y)
			};
			
			//draw vector is left point -> right point
			let draw_vector = {
				x: -from_prev.y, //rotate from_prev clockwise
				y: from_prev.x
			};
			//scale magnitude to half of band width
			let draw_vector_mag = Math.hypot(draw_vector.x, draw_vector.y);
			draw_vector.x *= (0.5*BAND_WIDTH / draw_vector_mag);
			draw_vector.y *= (0.5*BAND_WIDTH / draw_vector_mag);
			
			//get better draw vectors (but keep the old one, still useful), so that the strands stop half of BAND_WIDTH before the step's point - makes the turns work better			let draw_back_vector = {
			let from_prev_mag = Math.hypot(from_prev.x, from_prev.y);
			let right_draw_vector = {
				x: draw_vector.x - (from_prev.x * (0.5*BAND_WIDTH/from_prev_mag)),
				y: draw_vector.y - (from_prev.y * (0.5*BAND_WIDTH/from_prev_mag))
			};
			let left_draw_vector = {
				x: -draw_vector.x - (from_prev.x * (0.5*BAND_WIDTH/from_prev_mag)),
				y: -draw_vector.y - (from_prev.y * (0.5*BAND_WIDTH/from_prev_mag))
			};
			
			//determine if we're turning left or right
			//https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
			let turn_dir = 0;
			if(s > 0){
				turn_dir = (step.x - prev_prev.x)*(prev.y - prev_prev.y) - (step.y - prev_prev.y)*(prev.x - prev_prev.x);
				//turn_dir<0 indicates turn right, turn_dir>0 indicates turn left
			}
			
			//add new points and strands
			//add buffering strand for turns
			if(turn_dir > 0){
				//left turn
				let buffer_right_p = this.newPoint(prev_left_p.x + 2*draw_vector.x, prev_left_p.y + 2*draw_vector.y);
				this.newStrand(prev_right_p, buffer_right_p, step.over);
				prev_right_p = buffer_right_p;
			}
			if(turn_dir < 0){
				//right turn
				let buffer_left_p = this.newPoint(prev_right_p.x - 2*draw_vector.x, prev_right_p.y - 2*draw_vector.y);
				this.newStrand(prev_left_p, buffer_left_p, step.over);
				prev_left_p = buffer_left_p;
			}
			//else, either straight or we didn't have a previous step, so don't mess w/ turn buffering
			
			//add normal strands
			if(s < path.steps.length){
				let left_p = this.newPoint(step.x + left_draw_vector.x, step.y + left_draw_vector.y);
				let right_p = this.newPoint(step.x + right_draw_vector.x, step.y + right_draw_vector.y);
				this.newStrand(prev_left_p, left_p, path.steps[Math.max(0,s-1)].over);
				this.newStrand(prev_right_p, right_p, path.steps[Math.max(0,s-1)].over);
			
				prev_prev = prev;
				prev = step;
				prev_left_p = left_p;
				prev_right_p = right_p;
			}
			else { //we're doing the merge at the end
				this.newStrand(prev_left_p, path.merge_left_p);
				this.newStrand(prev_right_p, path.merge_right_p);
				
				path.merge_left_p.endpoint = false; //no longer an endpoint if they used to be
				path.merge_right_p.endpoint = false;
			}
		}
		
		this.orientStrands();
	}
	
	//function to copy this State and return an identical State object
	getCopy(){
		/*Plan:
		1. Make a new State object
		2. Copy the points over using the Point constructor and setting endpoint state (leave strands array empty)
		3. Copy the strands over, using the Strand constructor to refer to newly created points and over/under stuff. Only need to directly set the id state.
				-Note: this will update the existing copied points' strands array
		4. Copy the ordered_indices state array
		*/
		let copy = new State();
		
		//copy over points, keeping their strands arrays empty
		for(let p=0; p<this.points.length; p++){
			let new_point = new Point(this.points[p].x, this.points[p].y);
			new_point.endpoint = this.points[p].endpoint;
			
			copy.points.push(new_point);
		}
		
		//copy over strands
		for(let s=0; s<this.strands.length; s++){
			let p0_idx = this.points.indexOf(this.strands[s].p0);
			let p1_idx = this.points.indexOf(this.strands[s].p1);
			let new_strand = new Strand(copy.points[p0_idx], copy.points[p1_idx], this.strands[s].p0_over, this.strands[s].p1_over);
			new_strand.id = this.strands[s].id;
			
			copy.strands.push(new_strand);
		}
		
		//copy ordered indices array
		copy.ordered_indices = this.ordered_indices.slice(); //we can slice b/c ordered indices is an array of just integers, no deeper levels
		
		return copy;
	}
}

