//globals
let circles = [];
let circle_dirs = [];

let drag_element;
let drag_initial_offset = {x:0, y:0}; //in px, offset from center of circle when mouse initially grabbed hold

//flags
let circles_speeding = false;
let lagging = false; //set to true while lagging
let won = false; //if true, stop the alerts
let mouse_pos = {x:Infinity, y:Infinity}; //pageX and pageY, in px, updated by mousemove handler

//flags for alert messaging
let circles_sped_before = false;
let circles_teleported_before = false;
let n_lags = 0;
let time_last_runaway_alert = -Infinity; //set by performance.now()

//config
let n_circles = 12;
let n_runaway_circles = 4;
let runaway_threshold = 10; //vw
let runaway_max_extra_offset = 0.3; //vw
let max_turn_per_iteration = Math.PI/4;
let max_offset_per_iteration = 0.05; //vw
let max_offset_per_iteration_speeding = 0.5; //vw

let focus_fail_rate = 0.3;
let dragstart_fail_rate = 0.3;
let drag_fail_rate = 0.002; // during mousemoves so needs to be lower
let teleport_rate = 0.1;

let avg_sec_between_lags = 10;
let lag_duration = 800; //ms
let drag_lag_rate = 0.75;

let sec_between_time_alerts = 120;
let min_sec_between_runaway_alerts = 20;

let max_mouse_speed = 5;



function init(){ //called in the html file
  //init circles
  for(let i=0; i<n_circles; i++){
    let circle = document.createElement("div");
    circle.classList.add("circle");
    circle.classList.add(i%2==0? "red" : "blue");
    if(i<n_runaway_circles) circle.classList.add("runaway");

    circle.style.left = (10 + 80*Math.random()) + "vw";
    circle.style.top = (10 + 30*Math.random()) + "vw"; //containers are 10vw from the top, 30vw high

    document.body.appendChild(circle);
    circles.push(circle);
    circle_dirs.push(2*Math.PI*Math.random());
  }

  //animate circles
  setInterval(function(){
    if(lagging) return;

    for(let i=0; i<circles.length; i++){
      let circle = circles[i];
      if(circle == drag_element) continue;

      let left = Number(circle.style.left.split("vw")[0]);
      let top = Number(circle.style.top.split("vw")[0]);

      //give the circle a new direction (not too different from the previous), and an offset to move in that direction
      circle_dirs[i] += (max_turn_per_iteration)*(2*Math.random()-1);
      let offset = (circles_speeding ? max_offset_per_iteration_speeding : max_offset_per_iteration) * Math.random();

      //for circles that run away from the mouse if it's close
      if(circle.classList.contains("runaway")){
        //calculate direction to move away from mouse
        let mouse_vw = {
          x: mouse_pos.x / (window.innerWidth/100),
          y: mouse_pos.y / (window.innerWidth/100)
        };
        let dist_vw = Math.hypot(left-mouse_vw.x, top-mouse_vw.y);
        if(dist_vw < runaway_threshold){
          let theta = Math.acos((left-mouse_vw.x) / dist_vw);
          if(top-mouse_vw.y < 0) theta *= -1;
          let confusion_theta_offset = ((Math.floor((performance.now()/1000))%2)*2 - 1)*Math.PI/4; //make it go sideways, trickier to guide it
          circle_dirs[i] = theta + confusion_theta_offset;

          //interpolate between runaway offset and normal offset based on fraction of threshold distance
          let frac = 1 - (dist_vw / runaway_threshold); //1 minus, since want to be faster when closer
          offset = offset + frac*runaway_max_extra_offset;
        }

        if(dist_vw < 0.25*runaway_threshold &&
          Math.random() < 0.01 &&
          performance.now()-time_last_runaway_alert > 1000*min_sec_between_runaway_alerts)
        {
          alertEvent("runaway_circle");
          time_last_runaway_alert = performance.now();
        }
      }

      circle.style.left = left + offset*Math.cos(circle_dirs[i]) + "vw";
      circle.style.top = top + offset*Math.sin(circle_dirs[i]) + "vw";
    }
  }, 50);


  //lag
  setInterval(function(){
    let avg_lags_per_sec = 1/avg_sec_between_lags;
    if(!lagging && Math.random() < 0.25*avg_lags_per_sec){
      console.log("LAG");
      lagging = true;
      n_lags++;
      setTimeout(function(){
        lagging = false;
        if(Math.random() < 0.1 && n_lags >= 5){alertEvent("lag");}
      }, lag_duration);
    }
  }, 250);


  //cirle offscreen test
  setInterval(function(){
    let circles = document.getElementsByClassName("circle");
    for(let i=0; i<circles.length; i++){
      if(!circles[i].went_offscreen && isCircleOffscreen(circles[i], 0)){
        circles[i].went_offscreen = true; //don't check this circle anymore
        alertEvent("circle_offscreen");
        return; //no need to let them know if multiple went off at the same time
      }
    }
  }, 1003); //weird time so doesn't often overlap with circle animation, if that matters


  //tell the player they're taking too long
  let timeAlert = function(){
    alertEvent("time");
    setTimeout(timeAlert, 1000*sec_between_time_alerts);
  }
  setTimeout(timeAlert, 1000*sec_between_time_alerts);


  //miscellaneous annoying popups
  setInterval(function(){
    if(Math.random()<0.05){
      alertEvent("just_to_annoy");
    }
  }, 10000);
}



function numCirclesCorrectlySorted(){
  let count = 0;

  let red_circles = document.querySelectorAll(".circle.red");
  let blue_circles = document.querySelectorAll(".circle.blue");
  let red_box = document.getElementById("red_container").getBoundingClientRect();
  let blue_box = document.getElementById("blue_container").getBoundingClientRect();

  //test red circles
  for(let i=0; i<red_circles.length; i++){
    let rect = red_circles[i].getBoundingClientRect();
    if(rect.left > red_box.left &&
      rect.right < red_box.right &&
      rect.top > red_box.top &&
      rect.bottom < red_box.bottom)
    {count++;}
  }

  //test blue circles
  for(let i=0; i<blue_circles.length; i++){
    let rect = blue_circles[i].getBoundingClientRect();
    if(rect.left > blue_box.left &&
      rect.right < blue_box.right &&
      rect.top > blue_box.top &&
      rect.bottom < blue_box.bottom)
    {count++;}
  }

  console.log("count",count)
  return count;
}



function testForSuccess(){
  return numCirclesCorrectlySorted() == n_circles;
}


function isCircleOffscreen(circle, buffer){
  //buffer is extra distance it has to be offscreen, in vw, to make sure it really has left
  buffer = buffer*(window.innerWidth/100); //convert to px

  let rect = circle.getBoundingClientRect();
  if(rect.right < -buffer ||
    rect.bottom < -buffer ||
    rect.left > window.innerWidth+buffer ||
    rect.top > window.innerHeight+buffer
  )
  {return true;}
  return false;
}
