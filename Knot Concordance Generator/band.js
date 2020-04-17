class Band
{
	//the Band class takes a State object and adds strands as necessary to create a band
	//the State object doesn't know about the Band modifying it, this class is used as an independent convenient way to handle bands
	
	constructor(state, start_x, start_y){
		//member variables ---------------------------
		
		this.state = state;
		this.start_x = start_x;
		this.start_y = start_y;
		this.merged = false; //if this is true, no more modification allowed
		
		//internal storage stuff used for drawing
		this.tip; //point at the tip of the band, centered on the band. Not actually displayed, but stores the band tip's "position"
		this.left_p; //points near the tip of the band, which are being used when doing more reidemeister 2s
		this.right_p;
		this.prev_tip;
		
		//set up the band's loop ----------------------
		
		let top_left = this.state.newPoint(this.start_x - 0.5*BAND_WIDTH, this.start_y - 0.5*BAND_WIDTH);
		let bottom_left = this.state.newPoint(this.start_x - 0.5*BAND_WIDTH, this.start_y + 0.5*BAND_WIDTH);
		
		this.state.newStrand(top_left, bottom_left, true, "band");
		
		this.tip = new Point(this.start_x - 0.5*BAND_WIDTH, this.start_y); //using the Point class for convenient storage of x,y
		this.left_p = top_left; //previous point along the strand, to the left as you're facing forward on the strand (away from the loop)
		this.right_p = bottom_left; //same but to the right
		
		//add some stuff to x to put the first step just right of the loop, also will define this.prev_tip, enabling us to do the pretty-turn logic
		this.addStep(start_x + BAND_WIDTH, start_y, true);
	}
	
	addStep(x, y, over=true, merge_points=[]){
		//function moves the tip of the band to the new x,y, by drawing new strands. Goes over existing ones if "over" is true, else goes under
		//if merge points is an array of 2 points, will merge instead of do normal behavior
		
		if(this.merged){
			throw new Error("Band is merged, cannot add new step");
		}
		
		//remove the tip strand (all the strands it might have been split into)
		for(let i=0; i<this.state.strands.length; i++){
			let s = this.state.strands[i];
			if(s.marker === "band_tip"){
				this.state.removeStrand(s);
			}
		}
		
		let merging = merge_points.length === 2;
		
		if(merging){
			x = (merge_points[0].x + merge_points[1].x)/2;
			y = (merge_points[0].y + merge_points[1].y)/2;
			over = true;
		}
		
		//get vector from previous point, so we can draw next points perpendicular to it, from the current step's x/y
		let from_prev = {
			x: (x - this.tip.x),
			y: (y - this.tip.y)
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
		
		//get better draw vectors (but keep the old one, still useful), so that the strands stop half of BAND_WIDTH before the step's point - makes the turns work better
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
		if(this.prev_tip){
			turn_dir = (x - this.prev_tip.x)*(this.tip.y - this.prev_tip.y) - (y - this.prev_tip.y)*(this.tip.x - this.prev_tip.x);
			//turn_dir<0 indicates turn right, turn_dir>0 indicates turn left
		}
		
		//add new points and strands
		//add buffering strand for turns
		if(turn_dir > 0){
			//left turn
			let buffer_right_p = this.state.newPoint(this.left_p.x + 2*draw_vector.x, this.left_p.y + 2*draw_vector.y);
			this.state.newStrand(this.right_p, buffer_right_p, over); //don't mark turn strands as band strands, to avoid doing a band-r2 over them
			this.right_p = buffer_right_p;
		}
		if(turn_dir < 0){
			//right turn
			let buffer_left_p = this.state.newPoint(this.right_p.x - 2*draw_vector.x, this.right_p.y - 2*draw_vector.y);
			this.state.newStrand(this.left_p, buffer_left_p, over); //don't mark turn strands as band strands, to avoid doing a band-r2 over them
			this.left_p = buffer_left_p;
		}
		//else, either straight or we didn't have a previous step, so don't mess w/ turn buffering
		
		//add strands
		if(merging){
			//do a check to avoid twisting
			let L_test_strand = {
				p0: this.left_p,
				p1: merge_points[0]
			}
			let R_test_strand = {
				p0: this.right_p,
				p1: merge_points[1]
			}
			if(intersect(L_test_strand, R_test_strand)){
				//swap the merge points
				let tmp = merge_points[0];
				merge_points[0] = merge_points[1];
				merge_points[1] = tmp;
				console.log("SWAPPED!");
			}
			
			this.state.newStrand(this.left_p, merge_points[0], true, "band");
			this.state.newStrand(this.right_p, merge_points[1], true, "band");
			
			merge_points[0].endpoint = false;
			merge_points[1].endpoint = false;
			this.merged = true;
		}
		else {
			let new_left_p = this.state.newPoint(x + left_draw_vector.x, y + left_draw_vector.y);
			let new_right_p = this.state.newPoint(x + right_draw_vector.x, y + right_draw_vector.y);
			this.state.newStrand(this.left_p, new_left_p, over, "band");
			this.state.newStrand(this.right_p, new_right_p, over, "band");
			
			//tip strand (temporary, removed and redrawn each time, enables region detection at each step
			this.state.newStrand(new_left_p, new_right_p, false, "band_tip"); //p0, p1, over, marker, p0_over=true, p1_over=true
			
			this.prev_tip = this.tip;
			this.tip = new Point(x,y);
			this.left_p = new_left_p;
			this.right_p = new_right_p;
		}
		
		this.state.updateRegions();
	}
	
	merge(strand){
		//argument is the strand to open a gap in and merge this band into
		if(this.state.strands.indexOf(strand) === -1){
			throw new Error("Cannot merge into a strand not in this state");
		}
			
		//go to an r2 point first to make it look pretty
		//NOTE: might like to check that this doesn't intersect the merge strand for aesthetics
		let will_r2_p_work = true;
		let tip_region = this.getTipRegion();
		let r2_p = tip_region.getR2Point(strand);
		let test_strand = {
			p0: this.tip,
			p1: r2_p
		}
		if(intersect(test_strand, strand)){ //this check isn't enough
			//try the other r2 point
			let other_region = (tip_region === strand.regions[0] ? strand.regions[1] : strand.regions[0]);
			r2_p = other_region.getR2Point(strand);
			test_strand.p1 = r2_p;
			if(intersect(test_strand, strand)){
				will_r2_p_work = false;
			}
		}
		
		if(will_r2_p_work){
			this.addStep(r2_p.x, r2_p.y, true);
		}
		
		strand.show();
		
		
		//merge
		//test if this order causes a twist - don't want that
		//NOTE: NOT FOOLPROOF YET, THE TURN BUFFER STRAND CAN MESS US UP, OR THE TWIST CAN HAPPEN IF ONE OF THESE STRANDS INTERSECTS AN EXISTING BAND STRAND
		let merge_points = strand.openGap();
		/*let s1 = {
			p0: this.left_p,
			p1: merge_points[0]
		};
		let s2 = {
			p0: this.right_p,
			p1: merge_points[1]
		};
		if(intersect(s1, s2)){
			//flip the order of merge points
			let tmp = merge_points[0];
			merge_points[0] = merge_points[1];
			merge_points[1] = tmp;
		}*/
		this.addStep(undefined, undefined, true, merge_points);
	}
	
	getTipRegion(){
		//function to find which region the tip is in, assumes the state's regions have been updated - in theory they're always updated
		//note: this.tip is slightly ahead of where the band visually appears to end, b/c that helps with drawing
		//		It also helps with this b/c the detected region will never be inside the band
		
		for(let i=0; i<this.state.regions.length; i++){
			let region = this.state.regions[i];
			if(region.isPointInside(this.tip)){
				return region;
			}
		}
		throw new Error("Tip is not inside any region, something went wrong");
	}
	
	doR2(strand, over=true, over2=true){
		//NOTE: the strand must be part the region where the tip point is, or this will fail (the Region class won't be able to find the R2 point)
		//over2 is for r2 moves involving going under/over the band, where there are 2 over/under choices
		
		//determine which region we start in and which region we're going to
		let tip_region = this.getTipRegion();
		if(!strand.regions){
			console.log("doR2() - strand.regions undefined");
			debugger;
		}
		let other_region = (tip_region === strand.regions[0] ? strand.regions[1] : strand.regions[0]);
			//need to define other_region before adding a step, since adding steps updates the regions - replacing current region objects with new ones
		
		//determine r2 points - do this before adding steps for same reason as other_region
		//do the appropriate r2 moves too, while we're in the if statement
		let p0, p1, p2;
		if(strand.marker == "band"){
			p0 = tip_region.getR2Point(strand);
			
			let r2_vector = {
				x: strand.midpoint.x - p0.x,
				y: strand.midpoint.y - p0.y
			}
			//normalize
			let mag = Math.hypot(r2_vector.x, r2_vector.y);
			r2_vector.x /= mag;
			r2_vector.y /= mag;
			
			let wanted_mag = R2_DIST_FROM_STRAND + BAND_WIDTH;
			p1 = new Point(p0.x + r2_vector.x*wanted_mag, p0.y + r2_vector.y*wanted_mag);
			wanted_mag = R2_DIST_FROM_STRAND;
			p2 = new Point(p1.x + r2_vector.x*wanted_mag, p1.y + r2_vector.y*wanted_mag);
			
			if(Math.hypot(this.tip.x-p0.x, this.tip.y-p0.y) > R2_CLOSE_ENOUGH_RADIUS){
				this.addStep(p0.x, p0.y, true);
			}else{console.log("close enough")}
			this.addStep(p1.x, p1.y, over);
			this.addStep(p2.x, p2.y, over2);
		}
		else {
			p0 = tip_region.getR2Point(strand);
			p1 = other_region.getR2Point(strand); //does this need to be before the first this.addStep() ?
			
			if(Math.hypot(this.tip.x-p0.x, this.tip.y-p0.y) > R2_CLOSE_ENOUGH_RADIUS){
				this.addStep(p0.x, p0.y, true);
			}else{console.log("close enough")}
			this.addStep(p1.x, p1.y, over);
		}
		
		if(this.state.strands.indexOf(strand) !== -1){
			throw new Error("Strand to R2 over still exists, intersection must not have registered or something");
		}
	}
	
	
}


/* Template:
function runBandAlgorithm(band){
	let state = band.state;
	
	//CODE IN HERE
	
	state.orientStrands();
}
*/

function runBandAlgorithm(band, num_R2s){
	//do the reidemeister 2s
	for(let n=0; n<num_R2s; n++){
		//band.state.updateRegions();
		
		//get strand to reid 2 over/under
		let options = {
			r2_valid: true,
			exclude: [band.tip_strand]
		};
		let strand_to_r2 = band.getTipRegion().getRandomStrand(options);
		if(!strand_to_r2){
			console.log("No strand to r2 to, merging instead of continuing");
			break;
		}
		let over = Math.random() > 0.5 ? true : false;
		let over2 = Math.random() > 0.5 ? true : false; //only used for band r2s but always specify it
		
		band.doR2(strand_to_r2, over, over2);
		
		drawEverything(input_canvas, band.state);
		//debugger;
	}
	
	//merge
	let options = {
		exclude: [band.tip_strand],
		min_length: 1.5*BAND_WIDTH
	};
	let merge_strand = band.getTipRegion().getRandomStrand(options);
	if(!merge_strand){throw new Error("couldn't find a merge strand")}
	band.merge(merge_strand);
	
	band.state.orientStrands();
}