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
	
	//check if correct data type
	if(fileText.split("*")[0] !== "pic"){
		alert("Incorrect file type.");
		return;
	}
	
	//clear current display
	ctx.clearRect(0,0,canvas.width,canvas.height);
	drawGridlines();
	
	//extract nonogram data
	nonogram = JSON.parse(fileText.split("*")[1]);
	
	//clear dialog window
	uploadDownloadWindow.style.display = "none";
	uploadDownloadWindowOpen = false;
	
	//set global variables correctly
	minX = 0;
	minY = 0;
	
	//display nonogram data
	drawData(0,0); //draw at absolute coordinates (0,0)
}