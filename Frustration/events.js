document.addEventListener("click", handleClick);
document.addEventListener("mousedown", handleMousedown);
document.addEventListener("mouseup", handleMouseup);
document.addEventListener("mousemove", handleMousemove);


function handleClick(e){

}


function handleMousedown(e){
  if(e.target.classList.contains("focus") && e.target.classList.contains("circle") && Math.random()>dragstart_fail_rate){
    drag_element = e.target;
    let style = getComputedStyle(e.target);
    drag_initial_offset = {
      x: Number(style.left.split("px")[0]) - e.pageX,
      y: Number(style.top.split("px")[0]) - e.pageY
    }
  }
}

function handleMouseup(e){
  //remove focus
  let focused = document.getElementsByClassName("focus");
  for(let i=0; i<focused.length; i++){
    focused[i].classList.remove("focus");
  }

  //if had clicked on a circle, add focus (or just teleport it)
  if(e.target.classList.contains("circle")){
    if(Math.random() < teleport_rate){
      //re-init circle's position
      e.target.style.left = (10 + 80*Math.random()) + "vw";
      e.target.style.top = (10 + 30*Math.random()) + "vw"; //containers are 10vw from the top, 30vw high
    }
    else if(!drag_element && Math.random() > focus_fail_rate){
      //checking if no drag element b/c don't want to add focus to a circle that was just finished dragging
      e.target.classList.add("focus");
    }
  }


  drag_element = undefined;
}


function handleMousemove(e){

  //cursor
  if(!lagging){
    let cursor = document.getElementById("cursor");
    cursor.style.left = e.pageX + "px";
    cursor.style.top = e.pageY + "px";
  }

  if(drag_element && !lagging){
    //drag the circle
    let px_per_vw = window.innerWidth/100;
    drag_element.style.left = (e.pageX+drag_initial_offset.x) / px_per_vw + "vw";
    drag_element.style.top = (e.pageY+drag_initial_offset.y) / px_per_vw + "vw";

    //troll
    if(Math.random() < drag_fail_rate){
      drag_element.classList.remove("focus");
      drag_element = undefined;
    }
  }


  //track mouse speed
  let scale = 1000/window.innerWidth; //so that mouse speed is relative to sizes of everything else
  let speed = Math.hypot(e.movementX*scale, e.movementY*scale);
  if(speed > max_mouse_speed){
    if(!circles_speeding){
      circles_speeding = true;
      setTimeout(function(){circles_speeding = false;}, 1000);
    }

  }
}
