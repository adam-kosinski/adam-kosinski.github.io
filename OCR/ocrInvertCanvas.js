function invertCanvas(ctx, data, alterDisplay){
	if(!alterDisplay){alterDisplay = true}
	
	var w = ctx.canvas.width;
	var h = ctx.canvas.height;
	
	if(alterDisplay){ctx.clearRect(0,0,w,h)}
	
	//loop through data
	for(var r=0; r<h; r++){
		for(var c=0; c<w; c++){
			if(data[r][c] === 1){
				data[r][c] = 0;
				/*pixel is already cleared*/
			} else { //anything besides 1 is 0 (or some marker that snuck in somehow - shouldn't happen though)
				data[r][c] = 1;
				if(alterDisplay){ctx.fillRect(c,r,1,1)}
			}
		}
	}
}