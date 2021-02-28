
class ForegroundObject {
  constructor(idx){
    this.frames = []; //stores arrays of points which are {x:_, y:_}

    //construct DOM interface
    this.div = document.createElement("div");
    this.div.id = "foreground_object_" + idx;
    this.div.textContent = idx + ": Editing ";

    //edit checkbox
    this.edit_checkbox = document.createElement("input");
    this.edit_checkbox.type = "checkbox";
    this.edit_checkbox.style.marginRight = "15px";
    this.div.appendChild(this.edit_checkbox);

    //view checkbox
    this.div.appendChild(document.createTextNode("Show"));
    this.view_checkbox = document.createElement("input");
    this.view_checkbox.type = "checkbox";
    this.view_checkbox.style.marginRight = "15px";
    this.div.appendChild(this.view_checkbox);

    let edit_box = this.edit_checkbox;
    let view_box = this.view_checkbox;
    this.edit_checkbox.addEventListener("change", function(e){updateCheckboxes(e.target, true, view_box)});
    this.view_checkbox.addEventListener("change", function(e){updateCheckboxes(e.target, false, edit_box)});

    //clear points button
    let button = document.createElement("button");
    button.textContent = "Clear Points";
    let clearPoints = this.clearPoints.bind(this);
    button.addEventListener("click", function(){clearPoints(current_image_idx)});
    this.div.appendChild(button);

    document.getElementById("foreground_objects").appendChild(this.div);

    this.updateColor();
  }

  addPoint(x, y, frame_idx){
    console.log("add point")
    //make new point list if doesn't exist already
    if(!this.frames[frame_idx]){
      this.frames[frame_idx] = [];
    }

    let point_list = this.frames[frame_idx];
    point_list.push({x: x, y: y});

    drawForegroundAnnotation();
    this.updateColor();
  }

  clearPoints(frame_idx){
    this.frames[frame_idx] = undefined;
    drawForegroundAnnotation();
    this.updateColor();
  }

  draw(ctx, frame_idx, close_and_fill=true){
    let point_list = this.frames[frame_idx];
    if(!point_list){
      console.log("no point list");
      return;
    }
    if(!point_list[0]){
      console.log("no points in point list");
      return;
    }

    ctx.beginPath();
    ctx.moveTo(point_list[0].x, point_list[0].y);
    for(let i=1; i<point_list.length; i++){
      ctx.lineTo(point_list[i].x, point_list[i].y)
    }
    if(close_and_fill){
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,0,0.5)";
      ctx.fill();
    }
    ctx.strokeStyle = "goldenrod";
    ctx.stroke();
    if(!close_and_fill){
      ctx.closePath(); //do it after stroking
      //also indicate last point with a circle
      ctx.beginPath();
      let last = point_list[point_list.length - 1];
      ctx.arc(last.x, last.y, 10, 0, 2*Math.PI);
      ctx.closePath();
      ctx.stroke();
    }
  }

  updateColor(){
    //changes the div's color to green if all frames have at least three points, red otherwise
    for(let i=0; i<n_inputs; i++){
      let frame_idx = i*(n_in_between_frames+1)
      if(!this.frames[frame_idx] || this.frames[frame_idx].length < 3){
        this.div.style.backgroundColor = "salmon";
        return;
      }
    }
    this.div.style.backgroundColor = "lightgreen";
  }
}




function updateCheckboxes(changed, is_edit, neighbor){
  //if not 'is_edit', then it's the view box
  //neighbor is the other checkbox associated with this foreground object

  //if checked edit box - uncheck all other edit boxes and the corresponding view box
  //if checked view box - uncheck corresponding edit box
  //if unchecked anything - do nothing extra

  if(changed.checked){

    if(is_edit){
      for(let i=0; i<foreground_objects.length; i++){
        let edit_checkbox = foreground_objects[i].edit_checkbox;
        if(edit_checkbox != changed){ //sidestepping 'this' binding
          edit_checkbox.checked = false;
        }
      }
    }

    neighbor.checked = false;
    
  }

  drawForegroundAnnotation();
}




function drawForegroundAnnotation(){

  //clear previous annotation first
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawImage(ctx, current_image_idx);

  for(let i=0; i<foreground_objects.length; i++){
    let obj = foreground_objects[i];

    if(obj.edit_checkbox.checked){
      obj.draw(ctx, current_image_idx, false);
    }
    else if(obj.view_checkbox.checked){
      obj.draw(ctx, current_image_idx);
    }
  }
}
