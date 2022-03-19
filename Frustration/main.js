//globals
let circles = [];
let circle_dirs = [];
let circle_movement_interval;
let lag_interval;

let drag_element;
let drag_initial_offset = {x:0, y:0}; //in px, offset from center of circle when mouse initially grabbed hold

//flags
let circles_speeding = false;
let lagging = false; //set to true while lagging

//config
let n_circles = 12;
let max_turn_per_iteration = Math.PI/4;
let max_offset_per_iteration = 0.05; //vw
let max_offset_per_iteration_speeding = 0.35; //vw

let focus_fail_rate = 0.3;
let dragstart_fail_rate = 0.3;
let drag_fail_rate = 0.002; // during mousemoves so needs to be lower
let teleport_rate = 0.1;
let avg_sec_between_lags = 10;
let lag_duration = 800; //ms

let max_mouse_speed = 7;



function init(){
  //init circles
  for(let i=0; i<n_circles; i++){
    let circle = document.createElement("div");
    circle.className = "circle " + (i%2==0? "red" : "blue");

    circle.style.left = (10 + 80*Math.random()) + "vw";
    circle.style.top = (10 + 30*Math.random()) + "vw"; //containers are 10vw from the top, 30vw high

    document.body.appendChild(circle);
    circles.push(circle);
    circle_dirs.push(2*Math.PI*Math.random());
  }

  //animate circles
  circle_movement_interval = setInterval(function(){
    if(lagging) return;

    for(let i=0; i<circles.length; i++){
      let circle = circles[i];
      if(circle == drag_element) continue;

      let left = Number(circle.style.left.split("vw")[0]);
      let top = Number(circle.style.top.split("vw")[0]);

      circle_dirs[i] += (max_turn_per_iteration)*(2*Math.random()-1);
      let offset = (circles_speeding ? max_offset_per_iteration_speeding : max_offset_per_iteration) * Math.random();

      circle.style.left = left + offset*Math.cos(circle_dirs[i]) + "vw";
      circle.style.top = top + offset*Math.sin(circle_dirs[i]) + "vw";
    }
  }, 50);


  //lag
  lag_interval = setInterval(function(){
    let avg_lags_per_sec = 1/avg_sec_between_lags;
    if(!lagging && Math.random() < 0.25*avg_lags_per_sec){
      console.warn("LAG");
      lagging = true;
      setTimeout(function(){lagging = false}, lag_duration);
    }
  }, 250);
}


init();




function setCursor(){
  //args "default" or "move"

}
