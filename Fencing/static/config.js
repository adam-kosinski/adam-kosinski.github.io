//note: all dimensions in 3-space are in inches

//sword properties
let blade_length = 35; //inches
let blade_tip_width = 0.4;
let blade_base_width = 0.8;
let grip_length = 7;
let grip_width = 1;
let guard_radius = 3;
let default_guard_color = "dimgrey";
let default_blade_color = "gray";



//player properties
let max_health = 100;

let player_height = 66;
let player_width = 16; //at chest
let player_depth = 8; //at chest

let head_height = player_height / 7.5;
let eye_height = player_height - 0.5*head_height;

let hand_radius = 1.5; //hand is approximated by a sphere
let wrist_radius = 1;
let elbow_radius = 1.5;
let shoulder_radius = 2;

let lower_arm_length = 13; //center of elbow to center of hand
let upper_arm_length = 13; //center of shoulder to center of elbow

let default_shirt_color = "lightgrey";
let default_skin_color = "burlywood";


//constraints
let min_sword_angle = 0; //sword rotate left/right
let max_sword_angle = 0;
let min_sword_snap = 0.05; //snap is angle between forearm and sword vectors
let max_sword_snap = (2/3)*Math.PI; //ALSO IN SERVER CONFIG. based on physical constraint
//note sword twist is controlled by forearm

let min_elbow_angle = (2/3)*Math.PI;
let max_elbow_angle = Math.PI - 0.05; //can't be perfectly straight b/c then can't cross forearm and upper arm vectors to get that rotation axis (used for changing elbow angle)


//initial states
let initial_arm_theta = 0;
let initial_arm_phi = (2/3)*Math.PI;
let arm_twist = -(1/6)*Math.PI; //amount to rotate arm around main arm axis, for a more natural look. Theta/phi don't change this
let initial_elbow_angle = min_elbow_angle; //angle of bend in the elbow


//offsets (all from player position)
let camera_offset = {x: 0, y: eye_height, z:30};


//input config
let px_per_inch = 30; //used to convert mouse movement into sword movement
let px_scroll_per_radian = 200; //used to convert mouse scrolling into sword rotation


/*
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

*/
