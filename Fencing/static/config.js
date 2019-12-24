//note: all dimensions in 3-space are in inches

//canvas dimensions
let renderWidth = 500; //px
let renderHeight = 500;


//region boundaries - based on mouse's position on webpage
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
let blade_length = 35; //inches
let blade_tip_width = 0.4;
let blade_base_width = 0.8;
let grip_length = 7;
let grip_width = 1;
let guard_radius = 3;
let default_blade_color = "gray";


//player properties
let max_health = 100;
