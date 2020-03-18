let name = prompt("Please enter a name:");
if(!name || name===""){name = "unnamed"}

let canvas = document.getElementById("canvas");
//setup canvas display
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";

let ctx = canvas.getContext("2d");


//region boundaries
//x_left, x_right, y_low, and y_high outline a rectangle that form the 'center' region

let y_high = 100;
let y_low = 500;

let x_left = 400; //left side of my body
let x_right = 500; //right side of my body
let x_center = (x_left + x_right)/2;

//input boundaries - if the mouse moves outside of this, the program will use the boundary value instead

let x_min = x_left - 100;
let x_max = x_right + 100;
let y_min = y_high;
let y_max = y_low;


//sword properties
let blade_length = 300; //px
let blade_width = 15;
let hilt_length = 30;
let hilt_width = 10;
let guard_length = 50;
let guard_width = 10;