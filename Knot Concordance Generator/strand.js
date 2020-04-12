class Point {
	//WARNING: ANY MODIFICATIONS TO MEMBER VARIABLES NEED TO BE UPDATED IN state.js, getCopy() METHOD
	
	constructor(x, y){
		this.x = x;
		this.y = y;
		this.endpoint = false; //used to determine if another strand can be joined to this point when drawing
		this.strands = []; //array of connected strands
	}
	
	isCrossing(){
		return this.strands.length == 4;
	}
	
	flipCrossing(){
		if(!this.isCrossing()){
			throw new Error("Point is not a crossing, cannot flip it");
		}
		for(let i=0; i<this.strands.length; i++){
			let strand = this.strands[i];
			//flip the correct end of each strand
			if(strand.p0 == this){
				strand.p0_over = !strand.p0_over;
			}
			else {
				strand.p1_over = !strand.p1_over;
			}
		}
	}
	
	getCrossingSign(){ //returns 1 for positive crossing, -1 for negative crossing
		if(!this.isCrossing()){
			throw new Error("Point is not a crossing, can't get crossing sign");
		}
		
		//sort strands counterclockwise, beginning with the understrand going in
		//determine understrand going in
		for(let i=0; i<this.strands.length; i++){
			let s = this.strands[i];
			if(s.p1 === this && s.p1_over === false){
				this.sortStrandsCounterclockwise(s);
				break;
			}
		}
		
		//examine the next strand counterclockwise around to determine positive/negative crossing
		let s = this.strands[1];
		if(s.p0 === this && s.p0_over === true){return 1;}
		else if(s.p1 === this && s.p1_over === true){return -1;}
		else {
			throw new Error("Something seems to be wrong with the crossing, strands not oriented as expected");
		}
	}
	
	sortStrandsCounterclockwise(start_strand){
		let start_angle = start_strand.getAngleFromPoint(this);

		let p = this; //for some reason, referring to this point as 'this' inside the sort function fails
		
		this.strands.sort(function(a,b){
			//sort in order of descending angles - this makes it appear counterclockwise
			let angle_a = a.getAngleFromPoint(p);
			while(angle_a > start_angle){angle_a -= 2*Math.PI;}
			let angle_b = b.getAngleFromPoint(p);
			while(angle_b > start_angle){angle_b -= 2*Math.PI;}
			
			return angle_b - angle_a;
		});
	}
	
	getPD(under_in){ //arg is the under-in strand to this crossing
		if(!this.isCrossing()){
			console.log("Can't get the PD code of the point b/c it's not a crossing",this);
			return;
		}
		
		this.sortStrandsCounterclockwise(under_in);
		
		//record the code
		let code = [];
		for(let i=0; i<this.strands.length; i++){
			if(this.strands[i].id){
				code.push(this.strands[i].id);
			}
			else {
				console.log("Couldn't get PD code for point, strand doesn't have an id", this, this.strands[i]);
				return;
			}
		}
		
		return code;
	}
	
	show(canvas=input_canvas){
		let ctx = canvas.getContext("2d");
		ctx.strokeStyle = "red";
		
		ctx.beginPath();
		ctx.arc(this.x, this.y, 5, 0, 2*Math.PI);
		ctx.closePath();
		ctx.stroke();
		
		ctx.strokeStyle = "black";
	}
}

class Strand {
	//WARNING: ANY MODIFICATIONS TO MEMBER VARIABLES NEED TO BE UPDATED IN state.js, getCopy() METHOD
	
	constructor(p0, p1, p0_over=true, p1_over=true, marker=undefined){		
		this.id = undefined; //used for PD stuff and maybe alexander stuff, the state class will assign this later in State.IDStrands()
		this.marker = marker; //used to mark a strand and track it through any intersection splits that happen - used mainly for marking the band and its tip strand
		
		this.p0 = p0;
		p0.strands.push(this);
		this.p1 = p1;
		p1.strands.push(this);
		
		this.p0_over = p0_over; //these are true/false based on whether or not it's an over or under crossing at that point
		this.p1_over = p1_over;
		
		this.regions = [];
		this.state = undefined; //set when the State object adds a strand via State.newStrand()
		
		this.length = Math.hypot(p1.x-p0.x, p1.y-p0.y);
		//unit vector
		this.unit = {
			x: (p1.x-p0.x)/this.length,
			y: (p1.y-p0.y)/this.length
		}
		this.midpoint = new Point( (p0.x+p1.x)/2, (p0.y+p1.y)/2 );
		
		this.strokeStyle = "rgb("+(Math.random()*256)+","+(Math.random()*256)+","+(Math.random()*256)+")";
	}
	
	flipOrientation(){
		let tmp = this.p0;
		this.p0 = this.p1;
		this.p1 = tmp;
		
		let tmp_over = this.p0_over;
		this.p0_over = this.p1_over;
		this.p1_over = tmp_over;
		
		this.unit = {
			x: (this.p1.x-this.p0.x)/this.length,
			y: (this.p1.y-this.p0.y)/this.length
		}
	}
	
	getAngleFromPoint(p){
		let p0, p1; //determine direction to calculate. We're using vector p0->p1 (p0==p)
		if(p == this.p0){
			p0 = this.p0;
			p1 = this.p1;
		}
		else if(p == this.p1){
			p0 = this.p1;
			p1 = this.p0;
		}
		else {
			console.log("Couldn't get angle from point for strand, point not in strand",p,this);
			return;
		}
		
		let theta = Math.acos((p1.x - p0.x)/this.length);
		if(p1.y - p0.y < 0){
			theta *= -1;
		}
		return theta;
	}
	
	getNextStrand(){
		//moving forwards (p0->p1), return the next strand (i.e. the other one connected to p1)
		for(let i=0; i<this.p1.strands.length; i++){
			let strand = this.p1.strands[i];
			if(strand != this && (
				(strand.p0 == this.p1 && strand.p0_over == this.p1_over) ||
				(strand.p1 == this.p1 && strand.p1_over == this.p1_over) //this check needed in case next strand has wrong orientation
			)){
				return strand;
			}
		}
		return false; //no next strand found
	}
	
	/*not using this:
	getPreviousStrand(){
		//moving backwards (p1->p0), return the previous strand (i.e. the other one connected to p0)
		for(let i=0; i<this.p0.strands.length; i++){
			let strand = this.p0.strands[i];
			if(strand != this && (
				(strand.p1 == this.p0 && strand.p1_over == this.p0_over) ||
				(strand.p0 == this.p0 && strand.p0_over == this.p0_over) //this check needed in case next strand has wrong orientation
			)){
				return strand;
			}
		}
		return false; //no next strand found
	}
	*/
	
	disconnect(){
		//remove strand from connected points' strands arrays
		let idx_p0 = this.p0.strands.indexOf(this);
		let idx_p1 = this.p1.strands.indexOf(this);
		if(idx_p0 != -1){
			this.p0.strands.splice(idx_p0, 1);
		}
		else {console.log("Couldn't remove, strand not found in its p0",this,this.p0);}
		
		if(idx_p1 != -1){
			this.p1.strands.splice(idx_p1, 1);
		}
		else {console.log("Couldn't remove, strand not found in its p1",this,this.p1);}
	}
	
	openGap(){ //returns array of the two new points created by the gap
		let state = this.state; //get a separate reference b/c this.state gets cleared when we remove this strand
		
		let mid_x = this.p0.x + this.unit.x * 0.5*this.length;
		let mid_y = this.p0.y + this.unit.y * 0.5*this.length;
		let p0_side_point = state.newPoint(mid_x - this.unit.x*0.5*BAND_WIDTH, mid_y - this.unit.y*0.5*BAND_WIDTH);
		let p1_side_point = state.newPoint(mid_x + this.unit.x*0.5*BAND_WIDTH, mid_y + this.unit.y*0.5*BAND_WIDTH);
		p0_side_point.endpoint = true;
		p1_side_point.endpoint = true;
		
		state.removeStrand(this);
		
		state.newStrand(this.p0, p0_side_point, true, undefined, this.p0_over, true); //p0, p1, over (for intersections), marker, p0_over, p1_over
		state.newStrand(p1_side_point, this.p1, true, undefined, true, this.p1_over);
		
		return [p0_side_point, p1_side_point];
	}
	
	isR2Valid(start_region=undefined){
		//start_region needed only if the strand has the "band" marker
		
		/*function to check for if we can do a reidemeister 2 move with the band under/over this strand
		we can if:
			this strand borders exactly 2 regions
			strand is longer than the minimum
			both of this strand's r2 points (band does the reid 2 by going to one point then going to the other,
				these are on either side of the strand's midpoint) are within their respective regions
			If it's a band strand, r2 moves go fully across, check if going fully across intersects exactly 2 strands
		*/
		if(this.regions.length != 2){console.log("r2 not valid b/c #regions != 2",this.regions.length,this.regions); return false;}
		
		if(this.length < R2_MIN_STRAND_LENGTH){console.log("r2 not valid b/c too short");return false;}
		
		if(this.marker == "band"){
			//can't easily get the region on the other side of the band, so instead create a fake strand that goes across the band
			//and make sure it intersects exactly twice
			
			if(!start_region){
				throw new Error("Can't compute isR2Valid() for strand w/ marker 'band', start_region not specified");
			}
			
			//get r2_p0 and r2_p1 (on opposite sides of the band)
			let r2_p0 = start_region.getR2Point(this);
			
			let r2_vector = {
				x: this.midpoint.x - r2_p0.x,
				y: this.midpoint.y - r2_p0.y
			}
			let cur_mag = Math.hypot(r2_vector.x, r2_vector.y);
			let wanted_mag = 2* R2_DIST_FROM_STRAND + BAND_WIDTH;
			r2_vector.x *= wanted_mag/cur_mag;
			r2_vector.y *= wanted_mag/cur_mag;
			
			let r2_p1 = new Point(r2_p0.x + r2_vector.x, r2_p0.y + r2_vector.y);
			
			//get fake strand, count number of intersections
			let fake_strand = new Strand(r2_p0, r2_p1);
			let n_intersections = 0;
			for(let i=0; i<this.state.strands.length; i++){
				let other_strand = this.state.strands[i];
				try { //to handle intersection-at-point errors
					if(intersect(fake_strand, other_strand)){
						n_intersections++;
					}
				}
				catch(error){
					console.log("r2 not valid b/c intersection at point w/ fake strand");
					return false;
				}
			}
			if(n_intersections != 2){
				console.log("r2 not valid b/c the strand is marked 'band' and an r2 over the full band intersects strands <2 or >2 times");
				return false;
			}
		}
		else {
			let r2_p0 = this.regions[0].getR2Point(this);
			let r2_p1 = this.regions[1].getR2Point(this);
			
			if(! (this.regions[0].isPointInside(r2_p0) && this.regions[1].isPointInside(r2_p1))){
				console.log("r2 not valid because r2 point not inside region");
				return false;
			}
		}
		
		return true;
	}
	
	draw(ctx){
		//ctx.strokeStyle = this.strokeStyle;
		
		if(!this.p0_over && !this.p1_over && this.length < 2*UNDERSTRAND_GAP){ //then this is an understrand and too small to show
			return;
		}
		
		ctx.beginPath();
		
		let x = this.p0.x + (this.p0_over? 0 : this.unit.x*UNDERSTRAND_GAP);
		let y = this.p0.y + (this.p0_over? 0 : this.unit.y*UNDERSTRAND_GAP);
		ctx.moveTo(x,y);
		
		x = this.p1.x - (this.p1_over? 0 : this.unit.x*UNDERSTRAND_GAP);
		y = this.p1.y - (this.p1_over? 0 : this.unit.y*UNDERSTRAND_GAP);
		ctx.lineTo(x,y);
		
		ctx.closePath();
		ctx.stroke();
		
		//draw orientation arrow
		if(this.length > 2*UNDERSTRAND_GAP + 2*ARROW_SIZE){ //check to make sure arrow will be comfortably visible
			let draw_vector = { //left -> right
				x: -this.unit.y * 0.5*ARROW_SIZE,
				y: this.unit.x * 0.5*ARROW_SIZE
			}
			
			let arrow_back_x = this.p0.x + (this.unit.x * (0.5*this.length - 0.5*ARROW_SIZE));
			let arrow_back_y = this.p0.y + (this.unit.y * (0.5*this.length - 0.5*ARROW_SIZE));
			let arrow_front_x = this.p0.x + (this.unit.x * (0.5*this.length + 0.5*ARROW_SIZE));
			let arrow_front_y = this.p0.y + (this.unit.y * (0.5*this.length + 0.5*ARROW_SIZE));
			
			ctx.beginPath();
			ctx.moveTo(arrow_front_x, arrow_front_y);
			ctx.lineTo(arrow_back_x - draw_vector.x, arrow_back_y - draw_vector.y);
			ctx.lineTo(arrow_back_x + draw_vector.x, arrow_back_y + draw_vector.y);
			ctx.closePath();
			ctx.fill();
		}
		
		ctx.strokeStyle = "black";
	}
	
	show(canvas=input_canvas){
		let ctx = canvas.getContext("2d");
		ctx.lineWidth = 5;
		this.draw(ctx);
		ctx.lineWidth = 1;
	}
}


function intersect(s1,s2){ //Input is 2 strands. Output is the intersection point if they intersect, else false
	/* Note: ideas taken from stack overflow https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
	If we represent s1 as point a -> point b, s2 as point c -> point d
	We can represent the intersection point as an initial point and going a certain %distance along a direction vector
	Call these distances d1, d2
	Setting the intersection points equal to each other, we can get the equations:
		ax-cx = d1(ax-bx) + d2(dx-cx)
		ay-cy = d2(ay-by) + d2(dy-cy)
	
	We can express these as matrices:
		B = DA, where D = [d1,d2]
	
	No intersection if det(A) = 0
	
	Solve for d1,d2 using the inverse matrix of A, if both are between 0% and 100% (between 0 and 1), the point is on the line segments
	Finally, use d1 to calculate the intersection point
	*/
	
	let a = s1.p0;
	let b = s1.p1;
	let c = s2.p0;
	let d = s2.p1;
	
	let det = (a.x-b.x)*(d.y-c.y) - (d.x-c.x)*(a.y-b.y);
	
	//test for intersection
	if(det == 0){
		return false;
	}
	
	//find d1 and d2
	let d1 = ((a.x-c.x)*(d.y-c.y) + (a.y-c.y)*(c.x-d.x)) / det;
	let d2 = ((a.x-c.x)*(b.y-a.y) + (a.y-c.y)*(a.x-b.x)) / det;
	
	//test if intersection is on the line segments
	if((0 < d1 && d1 < 1) && (0 < d2 && d2 < 1)){ //don't count intersections at the segment's endpoints
		//intersection exists, find and return it
		let x = a.x + d1*(b.x-a.x);
		let y = a.y + d1*(b.y-a.y);

		//get pixel offset representations of d1 and d2 (instead of the current percent representations) - to allow intersection-at-point error checking
		let ab_length = Math.hypot(a.x-b.x, a.y-b.y);
		let cd_length = Math.hypot(c.x-d.x, c.y-d.y);
		let d1_px = d1*ab_length;
		let d2_px = d2*cd_length;
		//check for intersection at point (within 1 px of the end of either strand)
		if(0<=d1_px && d1_px<=1 || ab_length-1<=d1_px && d1_px<=ab_length ||
		   0<=d2_px && d2_px<=1 || cd_length-1<=d2_px && d2_px<=cd_length){
			s1.show();
			s2.show();
			
			let ctx = input_canvas.getContext("2d");
			ctx.beginPath();
			ctx.arc(x,y,5,0,2*Math.PI);
			ctx.closePath();
			ctx.stroke();
			
			throw new Error("intersection at point");
		}
		
		return new Point(x,y);
	}
	else {
		return false;
	}
}