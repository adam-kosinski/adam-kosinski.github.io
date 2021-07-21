document.addEventListener("click", handleClick);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("mousemove", handleMousemove);


function handleClick(e){
  if(e.target == canvas){
    mouse_pos = [e.offsetX, e.offsetY];

    //start or continue polygon drawing
    if(!drawing_polygon){
      drawing_polygon = true;
      canvas.style.backgroundColor = "gold";
      polygon_being_drawn = new Polygon([[e.offsetX, e.offsetY]], true); //true for being drawn
    }
    //check if drawing finished - click on starting vertex and at least 3 vertices
    else if(math.distance(polygon_being_drawn.vertices[0], [e.offsetX, e.offsetY]) < SAME_VERTEX_RADIUS) {
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
  if(e.target == canvas){
    mouse_pos = [e.offsetX, e.offsetY];
    updateShadowPolygons(mouse_pos);
  }

  draw();
}
