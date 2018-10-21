var stripDirection = "initial"; //will get set to 1 for first strip
//  1 - top left to bottom right
// -1 - bottom right to top left

function stripOuterPixels(ctx,data){
	var t0 = performance.now();
	var totalSortTime = 0;
	//define prototype for a pixel object
	var Pixel = function(r,c,adjBlack,essential){
		this.r = r;
		this.c = c;
		this.adjBlack = adjBlack;
		this.essential = essential;
	}
	
	//get outer pixels (black pixels horiz./vert. adjacent to a white pixel)
	var outerPixels = [];
	for(var r=0,height=data.length; r<height; r++){
		for(var c=0,width=data[0].length; c<width; c++){
			if(data[r][c] === 1 && (getAdjPixel(data,r,c,0)===0 ||
									getAdjPixel(data,r,c,2)===0 ||
									getAdjPixel(data,r,c,4)===0 ||
									getAdjPixel(data,r,c,6)===0)) {
				//check if previously marked essential pixel, if so, don't add to outerPixels
				var alreadyEssential = false; //assume false
				for(var iterator=0,length=essentialPixels.length; iterator<length; iterator++){
					if(essentialPixels[iterator][0] === r && essentialPixels[iterator][1] === c){
						alreadyEssential = true;
						ctx.fillStyle = "000000";
						ctx.fillRect(c,r,1,1);
					}
				}
				//add to pixel list
				if(!alreadyEssential){outerPixels.push(new Pixel(r,c,undefined,false))}
			}
		}
	}
	 
	//define function to determine adjacent black and sort outerPixels from least to most black
	var removeEssential = function(){
		var ts0 = performance.now();
		if(outerPixels.length === 0){return}
		//loop through outerPixels, setting the adjBlack property
		for(var i=0, L=outerPixels.length; i<L; i++){
			pxR = outerPixels[i].r; //shorter references to r and c
			pxC = outerPixels[i].c;
			
			//set adjBlack property
			outerPixels[i].adjBlack = 0; //set to zero then add number of adjacent black
			for(var d=0; d<8; d++){
				outerPixels[i].adjBlack += getAdjPixel(data,pxR,pxC,d);
			}
			
			//if essential, remove pixel from outerPixels
			if(isPixelEssential(data,pxR,pxC) === true){
				var splicedPx = outerPixels.splice(i,1)[0];
				
				var fillStyleStorage = ctx.fillStyle;
				ctx.fillStyle = "black";
				ctx.fillRect(splicedPx.c,splicedPx.r,1,1);
				ctx.fillStyle = fillStyleStorage;
				
				essentialPixels.push([splicedPx.r,splicedPx.c]); //pixels can never become nonessential
				i--; //because we removed an item from the array
				L--;
			}
		}
		totalSortTime+=(performance.now() - ts0);
		
		
	}
	
	//strip pixels
	stripDirection = stripDirection===1 ? -1 : 1; //toggle stripDirection, stored as a global variable
	
		//iterate forward if stripDirection is 1, iterate backwards if it's -1
	removeEssential(); //do an initial sort
	
		//sort outerPixels based on the adjBlack, then r, then c property - smaller values should go first (lower index)
	outerPixels.sort(function(a,b){
		if(a.adjBlack - b.adjBlack !== 0){
			return a.adjBlack - b.adjBlack;
		} else if(a.r - b.r !== 0) {
			return stripDirection*(a.r - b.r);
		} else {
			return stripDirection*(a.c - b.c);
		}
	});
	if(outerPixels.length === 0){return "noMorePixelsToStrip"}
	while(outerPixels.length > 0){ //outerPixels should shrink until length is 0, then will stop
		var px = outerPixels[0];
		data[px.r][px.c] = 0;
		ctx.clearRect(px.c,px.r,1,1);
		outerPixels.splice(0,1);
		
		removeEssential(); //we want to check essential pixels between stripping pixels because last stripped pixel could've made another one essential
	}
	var t1 = performance.now();
	console.log("Total: "+(t1-t0));
	console.log("Sort: "+totalSortTime);
}