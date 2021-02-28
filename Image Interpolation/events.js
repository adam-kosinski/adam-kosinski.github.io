document.addEventListener("mouseover",handleMouseover);
document.getElementById("create_input").addEventListener("click", createInput);

function handleMouseover(e){
  if(e.target.classList.contains("image_item")){ //for both the divs and the inputs
    let div = e.target;
    if(e.target.tagName == "INPUT"){
      div = e.target.parentElement;
    }

    if(e.shiftKey && /image\d/.test(div.id)){

      //draw image onto the canvas such that it fits perfectly horizontally
      let idx = Number(div.id.match(/\d/)[0]);
      let img = images[idx];
      if(!img){return;}


      let dWidth = canvas.width;
      let dHeight = (img.height/img.width) * canvas.width;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(images[idx], 0, 0, dWidth, dHeight); //see input.js for images array


      //also do styling
      let prev_displayed = document.getElementsByClassName("displayed");
      for(let i=0; i<prev_displayed.length; i++){
        prev_displayed[i].classList.remove("displayed");
      }
      div.className = "displayed";
    }
  }
}
