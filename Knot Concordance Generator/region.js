class Region {
	constructor(strands){
		//arg is an array of strands, in order, that bound the region.
		//The inside is to the right as you move forwards around the region (forwards through the strands array)
		
		if(strands.length < 3){throw new Error("Region must have at least 3 strands, "+strands.length+" provided");}
		
		this.strands = strands.slice(); //don't want to assign w/o slicing b/c then if the arg is modified we have problems
	}
	
	addMeToStrands(){ //separate from the constructor b/c we make a lot of duplicate regions we don't want to keep around
		//add this region to strands' regions arrays
		for(let i=0; i<this.strands.length; i++){
			this.strands[i].regions.push(this);
		}
	}
	
	disconnect(){
		//remove this region from the regions array of the strands
		for(let i=0; i<this.strands.length; i++){
			let s = this.strands[i];
			let idx = s.regions.indexOf(this);
			if(idx != -1){
				s.regions.splice(idx, 1);
			}
			else {
				console.warn("Can't disconnect region from strand - strand didn't think it was part of this region",s,this);
			}
		}
	}
	
	show(canvas=input_canvas){
		for(let i=0; i<this.strands.length; i++){
			this.strands[i].show(canvas);
		}
	}
	
	isOuter(){
		/*function to tell if this is an outer region
		It is if going forward through the strands array we travel counterclockwise around the region
		Add up all the angle offsets as we go around -> sign indicates if we went around clockwise or counterclockwise
		*/
		
		let delta_angle_total = 0;
		
		//3 points to consider at any time - 1) only belong to current, 2) belong to both, 3)only belong to next
		let current_p, shared_p, next_p;
		
		let first = this.strands[0];
		let second = this.strands[1];
		if(first.p0 === second.p0 || first.p0 === second.p1){
			current_p = first.p1;
			shared_p = first.p0;
		}
		else {
			current_p = first.p0;
			shared_p = first.p1;
		}
		
		for(let i=0; i<this.strands.length; i++){
			let current = this.strands[i];
			let next = this.strands[(i+1) % this.strands.length];
			
			next_p = (next.p0 === shared_p ? next.p1 : next.p0); //the point 'next' doesn't share with 'current'
			
			//get both strand's thetas
			let theta_current = current.getAngleFromPoint(current_p);
			let theta_next = next.getAngleFromPoint(shared_p);
			
			let d_theta = (theta_next - theta_current);
			while(d_theta < -Math.PI){
				d_theta += 2*Math.PI;
			}
			while(d_theta > Math.PI){
				d_theta -= 2*Math.PI;
			}
			
			delta_angle_total += d_theta;
			
			//update the points for the next pair of strands
			current_p = shared_p;
			shared_p = next_p;
			next_p = undefined;
		}
		
		return delta_angle_total < 0;
	}
	
	isDuplicateOf(other_region){ //returns true/false if the strands and strand order is the same (starting strand doesn't matter though)
		//check length of strand arrays
		if(this.strands.length !== other_region.strands.length){return false;}
		
		//see if our first strand is missing from the other region
		let other_idx_0 = other_region.strands.indexOf(this.strands[0]);
		if(other_idx_0 === -1){ //then it's missing, so they're different
			return false;
		}
		else {
			//then the other region has our first strand. Loop through and check if the sequence is the same
			let n_strands = other_region.strands.length; //alias
			
			for(let i=1; i<this.strands.length; i++){
				let our_strand = this.strands[i];
				let their_strand = other_region.strands[(other_idx_0 + i + n_strands) % n_strands]; //the extra +n_strands is b/c javascript is bad at negative modulus
				if(our_strand !== their_strand){
					return false;
				}
			}
			//if we got through the for loop, the sequence is correct, so they're identical
			return true;
		}
	}
	
	isPointInside(point){
		//create a fake strand going from the point off to infinity to the right, count # intersections w/ strands in this region
		
		//for normal regions:
		//if even, outside the region
		//if odd, inside the region
		
		//for outer region, it's the opposite
		let getRandomVector = function(){
			let r = 10000;
			let theta = Math.random() * 2*Math.PI;
			
			let out = {
				p0: point,
				p1: {
					x: r*Math.cos(theta),
					y: r*Math.sin(theta)
				}
			};
			return out;
		};
		
		let fake_strand = getRandomVector();
		let n_intersections = 0;
		
		//note: need to do intersection at point error handling, rare as it is, it happened once to me
		let intersection_at_point = false;
		let safety_counter = 0; //to avoid infinite loop
		do {
			intersection_at_point = false;
			safety_counter++;
			if(safety_counter > 100){
				throw new Error("Over 100 intersection at points when trying to determine point in region");
			}
			
			try {
				//loop through region's strands, counting # intersections
				for(let i=0; i<this.strands.length; i++){
					let intersection = intersect(fake_strand, this.strands[i]);
					if(intersection){
						n_intersections++;
					}
				}
			} catch(error){
				//we got intersection at point, try again with a different direction for fake_strand
				intersection_at_point = true;
				fake_strand = getRandomVector();
				n_intersections = 0;
			}
		
		} while(intersection_at_point);
		
		//return result
		if(this.isOuter()){
			if(n_intersections % 2 == 0){return true;}
			else {return false;}
		}
		else {
			if(n_intersections % 2 == 0){return false;}
			else {return true;}
		}
	}
	
	getR2Point(strand){ //R2 = Reidemester 2, this function returns the point to which the band has to go before trying to reid 2 under/over a strand, or where it lands after it does that
		//make sure the given strand is in this region
		let idx = this.strands.indexOf(strand);
		if(idx == -1){
			throw new Error("Can't get draw point of a strand not in this region");
		}
		
		//get offset vector from midpoint - flip and negate unit vector, 
		let offset_vector = {
			x: -strand.unit.y * R2_DIST_FROM_STRAND,
			y: strand.unit.x * R2_DIST_FROM_STRAND
		};
		
		//check if the orientation of this strand doesn't match the orientation as you go around the region
		let next_strand = this.strands[(idx+1) % this.strands.length];
		if(! (strand.p1 === next_strand.p0 || strand.p1 === next_strand.p1) ){
			//then need to flip the offset vector
			offset_vector.x *= -1;
			offset_vector.y *= -1;
		}
		
		let x = strand.midpoint.x + offset_vector.x;
		let y = strand.midpoint.y + offset_vector.y;
		
		let r2_point = new Point(x,y);
		
		//r2_point.show();
		
		return r2_point;
	}
	
	getRandomStrand(options){
		//options is an object with the possible properties: {r2_valid: boolean, min_length: double, exclude: [array of strands]}
		//see the Strand class's .isR2Valid() method for more info on r2_valid
		
		let indices = Array.from(Array(this.strands.length).keys());
		//keep trying indices until we run out
		try_loop:
		while(indices.length > 0){
			let idx = indices.splice(Math.floor(Math.random()*indices.length), 1)[0];
			let strand = this.strands[idx];
			
			if(options.r2_valid === true){
				if(!strand.isR2Valid(this)){
					//strand.show();
					//debugger;
					//drawEverything(input_canvas, input);
					continue try_loop;
				}
			}
			if(options.min_length){
				if(strand.length < options.min_length){continue try_loop;}
			}
			if(options.exclude){
				for(let i=0; i<options.exclude.length; i++){
					if(strand === options.exclude[i]){continue try_loop;}
				}
			}
			return strand;
		}
		return false; //means none of the strands in the region met the conditions specified by the options object
	}
}


//function to get all the regions formed by strands, in the state. Returns an array of them
function getRegions(state){
	//start with a strand
	//go around the region clockwise until got back to where we started, storing strands along the way
		//clockwise will be determined by sorting strands coming out from points counterclockwise, and
		//just getting the next strand in that sorted list
		//NOTE: this means the outer region will be going counterclockwise (only one doing that), which is intentional b/c the "inside" for that will then be correct
	//add that region
	//start with the same strand again, but initially go the other way, still going clockwise - this is necessary to get everything
	//repeat for all strands
	//remove duplicate regions
	//note: if we just had a cycle, the inside vs. outside region will have a different strand order (reversed), so they'll be counted as distinct
	
	//sort point storage of strands counterclockwise, so we always know the order to go in when going around a region
	for(let i=0; i<state.points.length; i++){
		let p = state.points[i];
		if(p.strands.length > 0){
			p.sortStrandsCounterclockwise(p.strands[0]); //start with the current first strand, doesn't really matter
		}
	}
	
	let regions = []; //will store Region objects
	
	//loop through strands, find each strand's region
	for(let i=0; i<state.strands.length; i++){
		
		//loop for starting forwards the first time, then doing it again but starting backwards
		for(let dir=0; dir<2; dir++){
			
			let start_strand = state.strands[i];
			let start_p = dir === 0 ? start_strand.p0 : start_strand.p1;
			let region_strands = [];
			
			//go in the direction of the start strand's orientation - this direction is arbitrary
			
			let this_strand = start_strand;
			let prev_p = start_p;
			
			do {
				region_strands.push(this_strand);
				
				//next point is whichever point wasn't the previous point
				let next_p = this_strand.p0 === prev_p ? this_strand.p1 : this_strand.p0;
				
				if(next_p.strands.length < 2){
					console.log("Cannot find regions, knot has open endpoints. Returning an empty array");
					return [];
				}
				
				//get the next strand at that point
				let this_idx = next_p.strands.indexOf(this_strand);
				let next_strand = next_p.strands[(this_idx+1) % next_p.strands.length];
				
				/*
				this_strand.show();
				console.log("this");
				debugger;
				next_strand.show();
				console.log("next");
				debugger;
				drawEverything(input_canvas, input);
				*/
				
				//reset for next time
				this_strand = next_strand;
				prev_p = next_p;
			
			} while (this_strand !== start_strand);
			
			//create the new region
			regions.push(new Region(region_strands));
		}
	}
	
	//remove duplicates
	for(let i=0; i<regions.length; i++){
		for(let j=i+1; j<regions.length; j++){
			if(regions[i].isDuplicateOf(regions[j])){
				regions.splice(j, 1);
				//test this index again
				j--;
				continue;
			}
		}
	}
	
	return regions;
}



//debugging convenience:
function showRegions(state=input){
	state.updateRegions();
	for(let i=0; i<state.regions.length; i++){
		drawEverything(input_canvas, input);
		state.regions[i].show();
		debugger;
	}
}