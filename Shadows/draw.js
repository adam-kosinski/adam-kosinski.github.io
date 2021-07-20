function draw(info={}){
  //info has optional properties:
  //mouse_pos:[x,y]

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //shadow polygons
  shadow_polygons.forEach(poly => {
    poly.draw(ctx);
  });

  //polygons
  polygons.forEach(poly => {
    poly.draw(ctx);
  });
  if(polygon_being_drawn) polygon_being_drawn.draw(ctx);

  //mouse
  if(info.mouse_pos){
    ctx.beginPath();
    ctx.arc(info.mouse_pos[0], info.mouse_pos[1], 5, 0, 2*Math.PI);
    ctx.stroke();
  }
}
