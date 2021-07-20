document.addEventListener("click", handleClick);
document.addEventListener("keydown", handleKeydown);


function handleClick(e){
  if(e.target == canvas){
    console.log(e.offsetX, e.offsetY);

    //start or continue polygon drawing
    if(!drawing_polygon){
      drawing_polygon = true;
      canvas.style.backgroundColor = "lightblue";
      polygon_being_drawn = new Polygon([[e.offsetX, e.offsetY]], true); //true for being drawn
    }
    //check if drawing finished - at least 3 vertices and click on starting vertex
    else if(polygon_being_drawn.vertices.length >= 3 &&
            Math.hypot(polygon_being_drawn.vertices[0][0]-e.offsetX, polygon_being_drawn.vertices[0][1]-e.offsetY) < same_vertex_radius)
    {
      polygon_being_drawn.being_drawn = false;
      polygons.push(polygon_being_drawn);

      drawing_polygon = false;
      canvas.style.backgroundColor = "initial";
      polygon_being_drawn = undefined;
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
