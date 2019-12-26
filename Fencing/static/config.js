//note: all dimensions in 3-space are in inches

//sword properties
let blade_length = 35; //inches
let blade_tip_width = 0.4;
let blade_base_width = 0.8;
let grip_length = 7;
let grip_width = 1;
let guard_radius = 3;
let default_blade_color = "gray";



//player properties
	//measurements
let max_health = 100;
let player_height = 66;
let player_width = 16; //at chest
let player_depth = 8; //at chest
let head_height = player_height / 7.5;
let upper_arm_length = 0;
let lower_arm_length = 0;
let eye_height = player_height - 0.5*head_height;
	//constraints
let min_z_rot = 0; //sword rotate left/right
let max_z_rot = 0;
let min_x_rot = -2; //sword rotate forward/back, smaller = rotate away
let max_x_rot = 0;
//note: sword y_rot is always the same as the forearm/arm

//camera stuff
let camera_offset_from_head = {x: 0, y: 0, z:30};


//input config
let px_per_inch = 30; //used to convert mouse movement into sword movement
let px_scroll_per_radian = 200; //used to convert mouse scrolling into sword rotation


let on_guard = {x: player_width/2, y: player_height/2, z:10} //relative to player position (on the floor)


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





