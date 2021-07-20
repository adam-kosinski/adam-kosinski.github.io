document.addEventListener("click", handleClick);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("mousemove", handleMousemove);


function handleClick(e){
  if(e.target == canvas){
    console.log(e.offsetX, e.offsetY);

    //start or continue polygon drawing
    if(!drawing_polygon){
      drawing_polygon = true;
      canvas.style.backgroundColor = "lightyellow";
      polygon_being_drawn = new Polygon([[e.offsetX, e.offsetY]], true); //true for being drawn
    }
    //check if drawing finished - click on starting vertex and at least 3 vertices
    else if(Math.hypot(polygon_being_drawn.vertices[0][0]-e.offsetX, polygon_being_drawn.vertices[0][1]-e.offsetY) < SAME_VERTEX_RADIUS) {
      if(polygon_being_drawn.vertices.length >= 3){
        polygon_being_drawn.being_drawn = false;
        polygons.push(polygon_being_drawn);

        drawing_polygon = false;
        canvas.style.backgroundColor = "initial";
        polygon_being_drawn = undefined;
      }
      else {alert("Need at least 3 vertices");}
    }
    else {
      //add new vertex
      polygon_being_drawn.vertices.push([e.offsetX, e.offsetY]);
      console.log(polygon_being_drawn.vertices);
    }
  }

  draw();
}


function handleKeydown(e){
  if(e.key == "Escape"){
    if(drawing_polygon){
      drawing_polygon = false;
      canvas.style.backgroundColor = "initial";
      polygon_being_drawn = undefined;
    }
  }

  draw();
}



function handleMousemove(e){
  let draw_info = {};
  if(e.target == canvas){
    //draw_info.mouse_pos = [e.offsetX, e.offsetY];
    updateShadowPolygons([e.offsetX, e.offsetY]);
  }

  draw(draw_info);
}
