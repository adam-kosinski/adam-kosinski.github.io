function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  polygons.forEach(poly => {
    poly.draw(ctx);
  });
  if(polygon_being_drawn) polygon_being_drawn.draw(ctx);
}
