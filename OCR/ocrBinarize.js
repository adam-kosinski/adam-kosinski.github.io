function binarizeCanvas(ctx){
	ctx.fillStyle = "lightgray";
	var w = ctx.canvas.width;
	var h = ctx.canvas.height;
	
	//prepare a multidimensional array to store all the binary data
	var data = [];
	for(var r=0; r<h; r++){
		var rArray = [];
		for(var c=0; c<w; c++){
			rArray.push(0);
		}
		data.push(rArray);
	}
	
	imageData = ctx.getImageData(0,0,w,h).data;
	for(var i=0; i<w*h; i++){ //iterate through all pixels
		if(imageData[i*4+3] > 0){ //if alpha value is greater than 0, count that pixel as completely black
			var x = i%w;
			var y = Math.floor(i/w);
			ctx.fillRect(x,y,1,1);
			data[y][x] = 1; //add to data array
		}
	}
	
	//make pixels surrounded on three sides (orthogonally) black - aka 'remove dead ends'
	//define function here
	var checkFor3AdjBlack = function(r,c){
		var nOfAdjBlack = 0;
		nOfAdjBlack += (getAdjPixel(data,r,c,0) +
						getAdjPixel(data,r,c,2) +
						getAdjPixel(data,r,c,4) +
						getAdjPixel(data,r,c,6));
		
		if(nOfAdjBlack >= 3){ //if surrounded on three sides, make black, and check pixels adjacent to changed pixel to see if they should now be changed
			ctx.fillRect(c,r,1,1);
			data[r][c] = 1;
			
			for(var dir=0; dir<8; dir++){ //loop through dirs
				var R = r + Dirs[dir][0];
				var C = c + Dirs[dir][1];
				if(data[R][C] === 0){checkFor3AdjBlack(R,C)}
			}
		}
	}
		//run function here (iterate through pixels)
	for(var r=0; r<h; r++){
		for(var c=0; c<w; c++){
			if(data[r][c] === 0){checkFor3AdjBlack(r,c)} //check adjacent pixels if pixel is white
		}
	}
	
	console.log("done binarizing")
	return data;
}