let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");




let images = [];
let n_inputs = 0;




function createInput(){
  let idx = n_inputs;

  let container = document.createElement("div");
  container.id = "image" + idx;
  container.classList.add("image_item");
  container.textContent = idx + ": ";

  let input = document.createElement("input");
  input.type = "file";
  input.classList.add("image_item");
  container.appendChild(input);

  document.getElementById("inputs").appendChild(container);

  let reader = new FileReader();
  reader.addEventListener("load", function(){processFile(reader, idx)});
  input.addEventListener("change", function(){readFile(reader, input.files[0])});

  n_inputs++;
}


function readFile(reader, file){
  if(!file){return}
	reader.readAsDataURL(file); //when done, the event listener for the load event will direct flow to processFile()
}


function processFile(reader, storage_idx){
  let img = document.createElement("img");
  img.src = reader.result;
  images[storage_idx] = img;
}
