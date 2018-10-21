function getOrientations(item){ //'item' is a 3d array representing a puzzle part with a certain orientation
	var o = []; //o is short for orientations
	
	//move each 'face' to pointing up, get all 4 rotations with that face pointing up -> 24 orientations
	var Ro = deepCopy(item); //'rotated item' storage variable for face orientation
	
	//top face
	o.push(Ro);
	o.push(ro = rotate(Ro,"y")); //'ro' = 'rotated item' storage variable for rotations w/ same face orientation
	o.push(ro = rotate(ro,"y"));
	o.push(ro = rotate(ro,"y"));
	
	//right face
	o.push(Ro = rotate(Ro,"z"));
	o.push(ro = rotate(Ro,"y"));
	o.push(ro = rotate(ro,"y"));
	o.push(ro = rotate(ro,"y"));
	
	//bottom face
	o.push(Ro = rotate(Ro,"z"));
	o.push(ro = rotate(Ro,"y"));
	o.push(ro = rotate(ro,"y"));
	o.push(ro = rotate(ro,"y"));
	
	//left face
	o.push(Ro = rotate(Ro,"z"));
	o.push(ro = rotate(Ro,"y"));
	o.push(ro = rotate(ro,"y"));
	o.push(ro = rotate(ro,"y"));
	
	//front face
	o.push(Ro = rotate(Ro,"x"));
	o.push(ro = rotate(Ro,"y"));
	o.push(ro = rotate(ro,"y"));
	o.push(ro = rotate(ro,"y"));
	
	//back face
	o.push(Ro = rotate(rotate(Ro,"x"), "x")); //double rotate to get to back from front
	o.push(ro = rotate(Ro,"y"));
	o.push(ro = rotate(ro,"y"));
	o.push(ro = rotate(ro,"y"));
	
	//elminate duplicates
	return uniquefy(o);
}

function rotate(item,rotation){ //All rotations will be counterclockwise when looking at top, left, or front view. 'rotation' means rotation axis - can be "x", "y", or "z"
	//create a new array, iterate through 'item' and copy values over to appropriate spots in newItem
	//to rotate a face, do (x,y) -> (y,width-x) where x corresponds with width
	
	var nTiers = item.length;
	var nRows = item[0].length;
	var nCols = item[0][0].length;
	
	var h,l,w; //dimensions of new item
	
	if(rotation === "y"){
		h = nTiers; //unchanged
		l = nCols;
		w = nRows;
	}
	else if(rotation === "x"){
		h = nRows;
		l = nTiers;
		w = nCols; //unchanged
	}
	else if(rotation === "z"){
		h = nCols;
		l = nRows; //unchanged
		w = nTiers;
	}
	
	var newItem = arrayWithDimensions(h,l,w);
	
	for(var tier=0; tier<nTiers; tier++){
		for(var r=0; r<nRows; r++){
			for(var c=0; c<nCols; c++){
				if(rotation === "y"){ //(c,r) -> (r,nCols-1-c) //-1 compensates for fact that positive coordinates can be 0, unlike cartesian system
					newItem[tier][nCols-1-c][r] = item[tier][r][c];
				}
				else if(rotation === "x"){ //(r,tier) -> (tier,nRows-1-r)
					newItem[nRows-1-r][tier][c] = item[tier][r][c];
				}
				else if(rotation === "z"){ //(c,tier) -> (tier,nCols-1-c)
					newItem[nCols-1-c][r][tier] = item[tier][r][c];
				}
			}
		}
	}
	
	return newItem; //we shouldn't have double-reference problems, b/c copied values should all be numbers, not objects
}