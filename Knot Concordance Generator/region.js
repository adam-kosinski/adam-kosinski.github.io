class Region {
	constructor(strands){ //arg is an array of strands, in order, that bound the region. Forwards/backwards doesn't matter, just has to be in order
		if(strands.length < 3){throw new Error("Region must have at least 3 strands, "+strands.length+" provided");}
		
		this.strands = strands.slice(); //don't want to assign w/o slicing b/c then if the arg is modified we have problems
		
		this.fillStyle = "rgb("+(Math.random()*256)+","+(Math.random()*256)+","+(Math.random()*256)+")";
	}
	
	show(canvas=input_canvas){
		for(let i=0; i<this.strands.length; i++){
			this.strands[i].show(canvas);
		}
	}
	
	isDuplicateOf(other_region){ //returns true/false if the strands and strand order is the same
		//check length of strand arrays
		if(this.strands.length !== other_region.strands.length){return false;}
		
		//see if our first strand is missing from the other region
		let other_idx_0 = other_region.strands.indexOf(this.strands[0]);
		if(other_idx_0 === -1){ //then it's missing, so they're different
			return false;
		}
		else {
			//then the other region has our first strand. Loop through and check if the sequence is the same
			let sign = 1; //vs. -1, if it's a duplicate but our strand array goes forward and theirs goes backwards, need to subtract index instead of add
			let n_strands = other_region.strands.length; //alias
			
			for(let i=1; i<this.strands.length; i++){
				let our_strand = this.strands[i];
				let their_strand = other_region.strands[(other_idx_0 + (i*sign) + n_strands) % n_strands]; //the extra +n_strands is b/c javascript is bad at negative modulus
				if(our_strand !== their_strand){
					//maybe we got the order of the strands backwards in other_region, try going the other way
					if(sign == 1){ //only allow this flexiblity if we haven't tried flipping the sign yet
						sign = -1;
						//now try agian
						i--;
						continue;
					}
					return false;
				}
			}
			//if we got through the for loop, the sequence is correct, so they're identical
			return true;
		}
	}
	
	getRandomStrand(options){ //options is an object with the possible properties: {min_length: double, exclude: [array of strands]}
		let indices = Array.from(Array(this.strands.length).keys());
		//keep trying indices until we run out
		try_loop:
		while(indices.length > 0){
			let idx = indices.splice(Math.floor(Math.random()*indices.length), 1)[0];
			let strand = this.strands[idx];
			
			if(options.min_length){
				if(strand.length < min_length){continue try_loop;}
			}
			if(options.exclude){
				for(let i=0; i<exclude.length; i++){
					if(strand === exclude[i]){continue try_loop;}
				}
			}
			return strand;
		}
		return false;
	}
}


//function to get all the regions formed by strands, in the state. Returns an array of them
function getRegions(state){
	//start with a strand
	//go around the region clockwise until got back to where we started, storing strands along the way
		//clockwise will be determined by sorting strands coming out from points counterclockwise, and
		//just getting the next strand in that sorted list
		//NOTE: this means the outer region will be going counterclockwise (only one doing that), but I don't care
	//add that region
	//start with the same strand again, but initially go the other way, still going clockwise - this is necessary to get everything
	//repeat for all strands
	//remove duplicate regions
	//if only one region left at this point, means we had a cycle, so duplicate it to get the inside and outside
		//NOTE: if outer cycle split in any way, the outer region will already be acounted for separately
	
	//sort point storage of strands counterclockwise, so we always know the order to go in when going around a region
	for(let i=0; i<state.points.length; i++){
		let p = state.points[i];
		p.sortStrandsCounterclockwise(p.strands[0]); //start with the current first strand, doesn't really matter
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
					throw new Error("Cannot find regions, knot has open endpoints");
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
				//if the next point is the same as the starting point, we have a region, record it if we're not done with the while loop
				if(next_strand !== start_strand && next_p === start_p){
					regions.push(new Region(region_strands));
				}
				
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
	
	//if we have only one region, it's a cycle graph, duplicate that region to count for the outer region
	if(regions.length === 1){
		let outer_region = new Region(regions[0].strands.slice());
		regions.push(outer_region);
	}
	
	return regions;
}