function draw(){

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //mouse
  if(mouse_pos){
    let gradient = ctx.createRadialGradient(mouse_pos[0], mouse_pos[1], FULLY_LIT_DISTANCE, mouse_pos[0], mouse_pos[1], LIGHT_END_DISTANCE);
    gradient.addColorStop(0, "#fff0");
    gradient.addColorStop(1, "#aaa");

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  //shadow polygons
  shadow_polygons.forEach(poly => {
    poly.draw(ctx);
  });


  //polygons
  polygons.forEach(poly => {
    poly.draw(ctx);
  });
  if(polygon_being_drawn) polygon_being_drawn.draw(ctx);

}
