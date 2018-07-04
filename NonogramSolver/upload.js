document.getElementById("upload").addEventListener("click",upload);

//upload setup

//create input element with the correct attributes for uploading files and put an event listener on it
var input = document.createElement("input");
input.type = "file";
input.addEventListener("change", function(){readFile(input.files[0])});

//create a file reader to handle file reading and put an event listener on it
var reader = new FileReader();
reader.addEventListener("load",processFile);



//functions
function upload(){
	var files = input.files;
	
	//simulate click on input element
	input.click();
}



function readFile(file){
	if(!file){return}
	
	name = file.name.split("_")[1]; //name is a global variable
	
	reader.readAsText(file); //when done, the event listener for the load event will direct flow to processFile()
}



function processFile(){
	var fileText = reader.result;
	
	var puzzle = fileText.split("/")[0];
	var pic = fileText.split("/")[1];
	
	console.log(puzzle);
	
	//process puzzle/clues first:
		//check if correct data type
	if(puzzle.split("*")[0] !== "puzzle"){
		alert("Incorrect file type. Type detected:"+puzzle.split("*")[0]);
		return;
	}
		//extract clues data
	clues = JSON.parse(puzzle.split("*")[1]);
	
	
	//process pic second:
		//check if pic data is available
	if(pic && pic.split("*")[0] === "pic"){
		nonogram = JSON.parse(pic.split("*")[1]);
	} else {
		nonogram = array(clues.rows.length, array(clues.cols.length, 0));
	}
	console.log(nonogram);
	
	
	//create the table with gathered data
	createTable();
	
	
		//don't allow more than one upload per page refresh, b/c gets complicated if do, and refreshing isn't an issue
	document.getElementById("upload").style.display = "none";
	document.getElementById("create").style.display = "none";
	
	//close management window
	document.getElementById("uploadDownloadWindow").style.display = "none";
	document.getElementById("download").style.display = "block";
	document.getElementById("x").style.display = "block";
	dialogOpen = false;
}