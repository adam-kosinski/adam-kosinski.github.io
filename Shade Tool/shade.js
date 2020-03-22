let canvas = document.getElementById("canvas");
let test = document.getElementById("test");
let input = document.getElementById("input");
let img = document.getElementById("img");
let calc_button = document.getElementById("calc_button");
let output = document.getElementById("output");

let ctx = canvas.getContext("2d");

input.addEventListener("change", function(){readFile(input.files[0])});
img.addEventListener("load", drawImage);
calc_button.addEventListener("click",calculateShade);


//create a file reader to handle file reading and put an event listener on it
let reader = new FileReader();
reader.addEventListener("load",processFile);


function readFile(file){
	if(!file){return}	
	reader.readAsDataURL(file); //when done, the event listener for the load event will direct flow to processFile()
}

function processFile(){
	img.src = reader.result;	
}

function drawImage(){
	let style = getComputedStyle(img);
	let width = style.width.substring(0,style.width.length-2);
	let height = style.height.substring(0,style.height.length-2);
	
	//resize canvas
	canvas.width = width;
	canvas.height = height;
	canvas.style.width = width + "px";
	canvas.style.height = height + "px";
	
	test.width = width;
	test.height = height;
	test.style.width = width + "px";
	test.style.height = height + "px";
	
	//draw image
	ctx.drawImage(img, 0, 0);
}

function calculateShade(){
	let test_ctx = test.getContext("2d");
	
	//count black vs. white pixels
	let imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
	let data = imageData.data;
	
	let black_pixels = 0;
	
	let width = canvas.width;
	let height = canvas.height;
	for(let r=0; r<height; r++){
		for(let c=0; c<width; c++){
			let idx = 4*(r*width + c);
			
			let red = data[idx + 0] / 255;
			let green = data[idx + 1] / 255;
			let blue = data[idx + 2] / 255;
			let alpha = data[idx + 3]; //just in case we want it
			
			if(r==0){console.log(red,green,blue,alpha);}	
			if((red+green+blue) / 3 < 0.5){
				black_pixels++;
				//test_ctx.fillRect(c,r,1,1);
			}
		}
	}
	
	output.textContent = "Shade: " + (black_pixels / (width*height));
}