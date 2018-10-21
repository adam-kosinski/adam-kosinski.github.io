function isInputValid(){
	//if part structure is invalid (i.e. not all cubes orthogonally connected)
	//locate one cube, flag all connected ones, continue recursively. If after this there are still unflagged cubes left, it's a no.
	
	var isInputValid = true; //assume true unless fails a check
	
	var partsCopy = deepCopy(parts); //so we can make flags without messing anything up. Needs to be in this scope so the loops and flagCube() can access it
	
	//define flagging function that can be called recursively
	var flagCube = function(part,tier,r,c){
		var p = partsCopy[part];
		p[tier][r][c] = "x"; //flag cube
		//search for orthogonal adjacent cubes, call flagCube() on any found
		if(p[tier-1] ? p[tier-1][r][c]===1 : false){flagCube(part,tier-1,r,c)}
		if(p[tier+1] ? p[tier+1][r][c]===1 : false){flagCube(part,tier+1,r,c)}
		if(p[tier][r-1] ? p[tier][r-1][c]===1 : false){flagCube(part,tier,r-1,c)}
		if(p[tier][r+1] ? p[tier][r+1][c]===1 : false){flagCube(part,tier,r+1,c)}
		if(p[tier][r][c-1] ? p[tier][r][c-1]===1 : false){flagCube(part,tier,r,c-1)}
		if(p[tier][r][c+1] ? p[tier][r][c+1]===1 : false){flagCube(part,tier,r,c+1)}
	}
	
	//loop through parts to test for part connectivity
	for(var part=0,nParts=parts.length; part<nParts; part++){
		//search for a unflagged cube in the part - run through twice: first to locate a cube and do flagging process, then to see if there's anything left
		for(var cycle=0; cycle<2; cycle++){
			iteration:
			for(var tier=0,nTiers=parts[part].length; tier<nTiers; tier++){
				for(var r=0,nR=parts[part][tier].length; r<nR; r++){
					for(var c=0,nC=parts[part][tier][r].length; c<nC; c++){
						if(partsCopy[part][tier][r][c] === 1){ //if found a cube
							if(cycle === 1){
								flagCube(part,tier,r,c); //initiate recursive flagging
								break iteration; //stop searching for a cube
							} else if(cycle === 2){ //means found a non-flagged cube after did the flagging process
								alert("INPUT ERROR:\nSome of the cubes in Part "+part+" aren't connected to the rest of the part.");
								return false;
							}
						}
					}
				}
			}
		}
	}
	
	//if a tier, row, or col is unused
	for(var part=0,nParts=parts.length; part<nParts; part++){
		//add value of each cell to appropriate index in each of arrays immediately below. If when finished, a tier, row, or col's sum is 0, it's a no.
		var tiers = [];
		var rows = [];
		var cols = [];
		for(var tier=0,nTiers=parts[part].length; tier<nTiers; tier++){
			for(var r=0,nR=parts[part][0].length; r<nR; r++){
				for(var c=0,nC=parts[part][0][0].length; c<nC; c++){
					
					var cell = parts[part][tier][r][c];
					tiers[tier] = tiers[tier] ? tiers[tier]+cell : cell;
					rows[r] = rows[r]? rows[r]+cell : cell;
					cols[c] = cols[c]? cols[c]+cell : cell;
				}
			}
		}
		
		for(tier in tiers){
			if(tiers[tier] === 0){
				alert("INPUT ERROR:\nTier "+tier+" of Part "+part+" is unused. All tiers, rows, and columns in a part must contain at least one cube. You may have to remove the part and redefine its dimensions to achieve this.");
				return false;
			}
		}
		for(r in rows){
			if(rows[r] === 0){
				alert("INPUT ERROR:\nRow "+r+" of Part "+part+" is unused. All tiers, rows, and columns in a part must contain at least one cube. You may have to remove the part and redefine its dimensions to achieve this.");
				return false;
			}
		}
		for(c in cols){
			if(cols[c] === 0){
				alert("INPUT ERROR:\nColumn "+c+" of Part "+part+" is unused. All tiers, rows, and columns in a part must contain at least one cube. You may have to remove the part and redefine its dimensions to achieve this.");
				return false;
			}
		}
	}
	
	//if improper amount of cubes
	if((puzzleL*puzzleW*puzzleH) !== nOfCubesEntered){
		alert("INPUT ERROR:\nTotal Cubes Entered: "+nOfCubesEntered+"\nCubes Necessary: "+(puzzleL*puzzleW*puzzleH));
		return false;
	}
	
	//if passed all checks, it's good to go!
	return true;
}