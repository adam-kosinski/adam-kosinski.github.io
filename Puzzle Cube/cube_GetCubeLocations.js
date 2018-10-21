function getCubeLocations(item){ //'item' is a 3d array representing a puzzle part with a certain orientation
	var locations = [];
	
	for(var t=0,nTiers=item.length; t<nTiers; t++){
		for(var r=0,nRows=item[0].length; r<nRows; r++){
			for(var c=0,nCols=item[0][0].length; c<nCols; c++){
				if(item[t][r][c] === 1){locations.push([t,r,c])}
			}
		}
	}
	
	return locations;
}