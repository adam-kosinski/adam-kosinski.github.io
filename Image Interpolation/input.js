
function createInput(){
  let idx = n_inputs*(1+n_in_between_frames);

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


  //update foreground object colors
  for(let i=0; i<foreground_objects.length; i++){
    foreground_objects[i].updateColor();
  }
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
