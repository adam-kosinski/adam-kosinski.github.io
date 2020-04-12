class State {
	//WARNING: ANY MODIFICATIONS TO MEMBER VARIABLES NEED TO BE UPDATED IN getCopy() METHOD
	
	constructor(){
		this.points = [];
		this.strands = [];
		this.ordered_strands = []; //the function IDStrands() below will fill this with strand indices in order of ID
			//NOTE: this.strands tends to be sorted a lot. When this happens, this array will be incorrect
		this.regions = [];
	}
	
	newPoint(x,y){
		let p = new Point(x,y);
		this.points.push(p);
		return p;
	}
	
	//add a new strand to the state, does intersection checking. Doesn't return the strand, since it might split into multiple
	newStrand(p0, p1, over=true, marker=undefined, p0_over=true, p1_over=true){ //third arg is if this strand should go over existing ones by default
		let new_strand = new Strand(p0,p1,p0_over,p1_over, marker);
		
		//intersection checking
		for(let s=0; s<this.strands.length; s++){
			let other_strand = this.strands[s];
			
			//if the strand is connected to either of the new strand's points, don't check for intersection - there won't be a meaningful one
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
				this.newStrand(p0, intersection, over, marker, p0_over, over); //preserve over/under at non-intersection points, set it at intersection points based on "over" arg
				this.newStrand(intersection, p1, over, marker, over, p1_over);
				//other strand
				this.newStrand(other_strand.p0, intersection, true, other_strand.marker, other_strand.p0_over, !over); //args follow same logic as for new strand, except we assume over is true (shouldn't matter really since no cascading intersections for this one)
				this.newStrand(intersection, other_strand.p1, true, other_strand.marker, !over, other_strand.p1_over);
				
				return; //other intersections will be taken care of by the recursive calls for new strands
			}
		}
		
		//if no intersections, push this strand
		this.strands.push(new_strand);
		new_strand.state = this;
	}
	
	removeStrand(strand){
		//remove strand from this state's strands array
		let idx = this.strands.indexOf(strand);
		if(idx == -1){
			throw new Error("Couldn't remove strand b/c couldn't find it in state's strands array");
		}
		this.strands.splice(idx, 1);
		
		//tell it it's no longer part of this state (not sure if necessary but hey doesn't hurt)
		strand.state = undefined;
		
		//disconnect it from its points
		strand.disconnect();
	}
	
	updateRegions(){
		//disconnect any existing regions
		for(let i=0; i<this.regions.length; i++){
			this.regions[i].disconnect();
		}
		
		this.regions = getRegions(this); //see region.js for function definition
		
		//tell strands which regions they belong to
		//add regions to appropriate strands
		for(let i=0; i<this.regions.length; i++){
			this.regions[i].addMeToStrands();
		}
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
				//drawEverything(input_canvas, input);
				//this.strands[i].show();
				//debugger;
				
				//if we got to this strand, its orientation was already good, so mark that
				strand_indices.splice(strand_indices.indexOf(i), 1);
				
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
	
	//function to assign strands IDs in order - for PD code
	IDStrands(type="pd"){
		//type can be "pd" or "alexander"
		
		type = type.toLowerCase();
		if(type !== "pd" && type !== "alexander"){
			throw new Error("Can't IDStrands, type argument ("+type+") is not 'pd' or 'alexander'");
		}
		
		let cur_id = type==="pd"? 1 : 0;
		let strand_indices = Array.from(Array(this.strands.length).keys()); //gets an array [0,1,2,3, ...]
		//this array is used to track what strands remain to be ID-ed. Strands w/ an ID get removed. The entry in the
		//array refers to the strand's index in this.strands
		
		this.ordered_strands = []; //clear it
		
		//sort this.strands so that strands w/ under-crossings at p0 come first, since we always need to start ID-ing each component
		//at a strand that just came out from under a crossing
		this.strands.sort(function(a,b){
			if(a.p0.isCrossing() && !b.p0.isCrossing()){return -1;}
			else if(b.p0.isCrossing() && !a.p0.isCrossing()){return 1;}
			else if(a.p0_over == false && b.p0_over == true){return -1;}
			else if (b.p0_over == false && a.p0_over == true){return 1}
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
				strand_indices.splice(strand_indices.indexOf(i), 1)[0];
				this.ordered_strands.push(this.strands[i]);
				
				//change id if we should
				if(this.strands[i].p1.endpoint){
					cur_id++;
					break;
				}
				if(this.strands[i].p1.isCrossing()){
					if(type === "pd"){
						cur_id++;
					}
					else if(type === "alexander" && this.strands[i].p1_over === false){
						cur_id++;
					}
				}
				
				next_strand = this.strands[i].getNextStrand();
				if(next_strand == false){
					throw new Error("Couldn't get next strand in IDStrands()");
				}
				i = this.strands.indexOf(next_strand);
				
			} while (next_strand != first_strand  && strand_indices.length > 0)
		}
	}
	
	getPD(){
		this.orientStrands();
		this.IDStrands("pd");
		
		//loop through strands in order, if come to a strand going under into a crossing, get the code of that crossing
		let PD = [];
		for(let i=0; i<this.ordered_strands.length; i++){
			let strand = this.ordered_strands[i];
			
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
	
	
	getAlexander(for_html=false){
		//if for_html is true, will do <sup> tags instead of ^ symbols
		/*
		ID the strands properly for alexander stuff - use an argument option for State.IDStrands()
		Fill the alexander matrix w/ the appropriate stuff, using t = big multiple of 10,
		    so the powers of t will stand out in the final determinant
		Remove a row and column
		Take the determinant
		Parse the result to separate powers of t, find coefficients by doing this
		Return a string representing the alexander polynomial
		*/
		
		this.IDStrands("alexander");
		let t_mag = 2;
		let t = 10**t_mag;
		
		//create alexander matrix - rows are crossings, columns are strands
		//new row added for each crossing we find, columns are indexed by the strand ID
		let matrix = [];
		
		//find number of different IDs (IDs start at 0), max_id+1 is the number of cols in the matrix
		let max_id = 0;
		for(let i=0; i<this.strands.length; i++){
			max_id = Math.max(max_id, this.strands[i].id);
		}
		
		//loop through crossings, add stuff to the matrix
		for(let i=0; i<this.points.length; i++){
			if(!this.points[i].isCrossing()){continue;}
			
			let p = this.points[i];
			let row = new Array(max_id+1).fill(0);
			
			//figure out if it's a positive or negative crossing
			let crossing_sign = p.getCrossingSign();
			
			//loop through strands attached to this crossing, using their ids to assign values
			for(let s=0; s<p.strands.length; s++){
				if(p.strands[s].p0 === p){
					if(p.strands[s].p0_over === true){ //this is the overstrand
						let value = crossing_sign==1 ? 1-t : 1-(1/t);
						row[p.strands[s].id] += value;
					}
					else { //this is the understrand out
						let value = crossing_sign==1 ? t : 1/t;
						row[p.strands[s].id] += value;
					}
				}
				else if(p.strands[s].p1 === p && p.strands[s].p1_over === false){ //this is the understrand in
					row[p.strands[s].id] += -1;
				}
			}			
			//get rid of floating point error and make all values integers
			for(let i=0; i<row.length; i++){
				row[i] = Math.round(row[i]*t); //multiplying by t ensures we get an integer, since smallest abs val is t^-1
				row[i] = math.bignumber(row[i]); //also need to use a big number so that we don't get floating point error w/ scientific notation
			}
			matrix.push(row);
		}
		let display_matrix = matrix.map(function(row){
			return row.map(function(x){
				return x.toString();
			});
		});
		console.log(display_matrix);
		
		//if no crossings, alexander polynomial should be 1
		if(matrix.length == 0){
			return "1";
		}
		
		//remove the last row and col (arbitrarily)
		matrix.pop();
		for(let i=0; i<matrix.length; i++){
			matrix[i].pop();
		}
		
		//compute the determinant
		let det = math.det(matrix); //from the math.js library
		
		//parse the result to get the coefficients
		let coefficients = []; //index = power of t
		
		let n = det.abs().floor();
		while(n.mod(t).equals(0)){ //make lowest power 0
			n = n.div(t);
		}
		let safety_counter = 0;
		while(n.greaterThan(0) && safety_counter < 100){
			console.log(n.toString());
			let last_bit = n.mod(t);
			n = n.div(t).floor();
			if(last_bit.greaterThan(t/2)){ //then the sign is negative
				let value = last_bit.minus(t);
				n = n.plus(1);
				coefficients.push(value.toString());
			}
			else { //the sign is positive
				coefficients.push(last_bit.toString());
			}
			safety_counter++;
		}
				
		let out = "";
		for(let i=coefficients.length-1; i>=0; i--){
			let c = coefficients[i];
			//sign
			if(c<0){
				out += "- ";
			}
			else {
				out += out.length==0 ? "" : "+ ";
			}
			//coefficient
			if(c != 1 && c != -1){
				out += Math.abs(c);
			}
			//power of t
			if(i == 0){
				out += "1";
			}
			else {
				out += "t";
				if(i != 1 && for_html){
					out += "<sup>" + i + "</sup>";
				}
				else if(i != 1){
					out += "^" + i;
				}
			}
			out += " ";
		}
		
		return out;
	}
	
	//function to copy this State and return an identical State object
	getCopy(){
		/*Plan:
		1. Make a new State object
		2. Copy the points over using the Point constructor and setting endpoint state (leave strands array empty)
		3. Copy the strands over, using the Strand constructor to refer to newly created points and over/under stuff. Only need to directly set the id state.
				-Note: this will update the existing copied points' strands array
				-Note: the strand's regions array will be filled up when we copy over the regions
		4. Copy regions over, using the Region constructor - will update the strands' regions arrays
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
			new_strand.marker = this.strands[s].marker;
			new_strand.strokeStyle = this.strands[s].strokeStyle;
			
			copy.strands.push(new_strand);
		}
				
		//copy over regions
		copy.updateRegions(copy);
		
		return copy;
	}
}

