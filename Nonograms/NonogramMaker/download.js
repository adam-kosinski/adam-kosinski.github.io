document.getElementById("download").addEventListener("click",download);

function download(){
	if(!nonogram[0]){
		alert("No nonogram found!");
		return;
	}
	
	do {
		var nonogramName = prompt("Nonogram name:\n\nNOTE: Underscore characters are not allowed.", name);
		if(nonogramName === null){return}
		if(nonogramName === ""){nonogramName = "Untitled"}
	} while (/_/.test(nonogramName) === true); //no underscores in nonogramName so can retrieve name upon future uploads
	
	var downloadType = prompt("Download 'pic' or 'puzzle'?");
	if(downloadType === "pic"){downloadPic(nonogramName)}
	if(downloadType === "puzzle"){downloadPuzzle(nonogramName)}
}



function downloadPic(nonogramName){
	var data = "pic*"+JSON.stringify(nonogram);
	downloadData(data,"pic",nonogramName);
}




function downloadPuzzle(nonogramName){
	//set up clues object to store the data
	var clues = {
		rows:array(nonogram.length, []),
		cols:array(nonogram[0].length, [])
	};
	
	//iterate through nonogram and store clue data
	for(var r=0; r<nonogram.length; r++){
		for(var c=0; c<nonogram[0].length; c++){
			//algorithm:
			//if data value is 1, if the previous nonogram value was 0 or undefined (along the nonogram row/col), push a 0 to the end of the data row/col. Add one to the last index of the data row/col
			//if data value is 0, do nothing
			
			if(nonogram[r][c] === 1){
				
				//do it for rows
				if(!nonogram[r][c-1]){
					clues.rows[r].push(0);
				}
				//do it for cols
				if(!nonogram[r-1] || !nonogram[r-1][c]){
					clues.cols[c].push(0);
				}
				
				clues.rows[r][clues.rows[r].length-1] += 1;
				clues.cols[c][clues.cols[c].length-1] += 1;
			}
		}
	}
	
	
	var data = "puzzle*"+JSON.stringify(clues);
	downloadData(data,"puzzle",nonogramName);
}



//the function that ACTUALLY downloads
function downloadData(data,type,nonogramName){
	var yesDownload = confirm("Nonogram Name: "+nonogramName+"\nDownload Type: "+type+"\n\nContinue?");
	if(!yesDownload){
		console.log(JSON.parse(data.split("*")[1])); //log the data anyways in the console, just don't download
		return;
	}
	
	//download:
	//create 'a' element
	//set download attribute to nonogram name
	//set href attribtue to correct type of data
	//initiate a click on the 'a' element
	
	var a = document.createElement("a");
	a.download = "_"+nonogramName+"_nonogram"+type[0].toUpperCase()+type.substring(1,type.length); //the '_' at the beginning is so it gets priority in alphabetization
	a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(data);
	a.click();
}