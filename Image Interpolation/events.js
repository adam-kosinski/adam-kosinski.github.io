document.addEventListener("mouseover", handleMouseover);
document.getElementById("create_input").addEventListener("click", createInput);
document.addEventListener("click", handleClick);

function handleMouseover(e){
  if(e.target.classList.contains("image_item")){ //for both the divs and the inputs
    let div = e.target;
    if(e.target.tagName == "INPUT"){
      div = e.target.parentElement;
    }

    if(e.shiftKey && /image\d/.test(div.id)){

      let idx = Number(div.id.match(/\d/)[0]);
      drawImage(ctx, idx);
      drawForegroundAnnotation();

      //also do styling
      let prev_displayed = document.getElementsByClassName("displayed");
      for(let i=0; i<prev_displayed.length; i++){
        prev_displayed[i].classList.remove("displayed");
      }
      div.className = "displayed";
    }
  }
}


function handleClick(e){

  if(e.target.id == "new_foreground_object"){
    if(current_image_idx !== undefined){
      foreground_objects.push(new ForegroundObject(foreground_objects.length));
    }
    else {
      alert("You need to view an image before creating a foreground object");
    }
  }

  if(e.target.id == "canvas"){
    //check for a currently edited foreground object
    for(let i=0; i<foreground_objects.length; i++){
      if(foreground_objects[i].edit_checkbox.checked){
        foreground_objects[i].addPoint(e.offsetX, e.offsetY, current_image_idx);
        break;
      }
    }
  }


}



function drawImage(ctx, idx){
  //draw image onto the canvas such that it fits perfectly horizontally

  let img = images[idx];
  if(!img){return;}

  current_image_idx = idx; //global

  let dWidth = canvas.width;
  let dHeight = (img.height/img.width) * canvas.width;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(images[idx], 0, 0, dWidth, dHeight); //see input.js for images array
}
