let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

//config ----------------
let SAME_VERTEX_RADIUS = 20; //px, clicking this close to the original point will finish the polygon drawing
let SHADOW_DISTANCE = 200; //px away from the mouse that shadows will be rendered
let N_SMOOTHING_SEGMENTS = 16; //see calc.js

//state -----------------
let drawing_polygon = false;
let polygon_being_drawn; //store a Polygon here when drawing, if we finish it gets pushed to polygons storage

//storage ------------------
let polygons = []; //stores Polygon objects representing obstacles
let shadow_polygons = []; //stores Polygon objects represented shadow area, see calc.js

class Polygon {
  constructor(vertices=[], being_drawn=false){
    this.vertices = vertices; //array of coord arrays: [x,y]
    this.being_drawn = being_drawn;
    this.color = "black";
  }
  draw(ctx){
    ctx.beginPath();
    for(let i=0; i<this.vertices.length; i++){
      let v = this.vertices[i];
      if(i == 0) ctx.moveTo(v[0], v[1]);
      else ctx.lineTo(v[0], v[1]);
    }
    if(this.being_drawn){
      ctx.stroke();
    }
    else{
      ctx.closePath();
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }
}

class ShadowPolygon extends Polygon {
  constructor(vertices=[]){
    super(vertices);
    this.color = "lightgray";
  }
}
