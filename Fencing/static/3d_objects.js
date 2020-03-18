//FUNCTIONS FOR CREATING 3D OBJECTS --------------------------------------------------------------------------------------------------

function newSword(guard_color=default_guard_color, blade_color=default_blade_color){
	//all config values from globals.js

	let sword = new THREE.Group();

	//sword blade
	let g_blade = new THREE.CylinderGeometry(blade_tip_width/2, blade_base_width/2, blade_length); //g = geometry; args - r top, r bottom, height
	let m_blade = new THREE.MeshStandardMaterial({color: blade_color}); //m = material
	let blade = new THREE.Mesh(g_blade, m_blade);
	blade.position.y = blade_length/2 + grip_length/2; //default is centered on origin, shift it so origin is midway down handle (rotation point)
	sword.add(blade);

	//sword hilt (guard + grip)
	let hilt = new THREE.Group();
	
	let g_guard = new THREE.SphereGeometry(guard_radius, 16, 4, 0, 2*Math.PI, 0, Math.PI/2); //r, width seg, height seg, phi_start, phi_sweep, theta_start, theta_sweep
	let m_guard = new THREE.MeshStandardMaterial({color: guard_color, side:THREE.DoubleSide});
	let guard = new THREE.Mesh(g_guard, m_guard);
	guard.position.y = grip_length/2 - guard_radius;
	hilt.add(guard);

	let g_grip = new THREE.CylinderGeometry(grip_width/2, grip_width/2, grip_length);
	let grip = new THREE.Mesh(g_grip, m_guard); //just use the guard's material
	hilt.add(grip);

	//no need to translate the hilt, it's already centered on the origin (rotation point) like I want

	sword.add(hilt);

	
	scene.add(sword);
	return sword;
}



function newForearm(skin_color=default_skin_color, shirt_color=default_shirt_color){
	//forearm contains hand, lower_arm, and elbow. Pivot point is center of elbow

	let forearm = new THREE.Group();


	//hand
	let g_hand = new THREE.SphereGeometry(hand_radius);
	let m_hand = new THREE.MeshLambertMaterial({color: skin_color}); //material for the forearm
	let hand = new THREE.Mesh(g_hand, m_hand);
	hand.position.y = lower_arm_length;
	forearm.add(hand);

	//lower_arm
	let g_lower_arm = new THREE.CylinderGeometry(wrist_radius, elbow_radius, lower_arm_length);
	let m_shirt = new THREE.MeshLambertMaterial({color: shirt_color});
	let lower_arm = new THREE.Mesh(g_lower_arm, m_shirt);
	lower_arm.position.y = lower_arm_length/2;
	forearm.add(lower_arm);

	//elbow
	let g_elbow = new THREE.SphereGeometry(elbow_radius);
	let elbow = new THREE.Mesh(g_elbow, m_shirt);
	forearm.add(elbow);
	
	forearm.length = lower_arm_length; //add my own property to the object

	//forearm is part of the arm, we add arm to the scene, not forearm

	return forearm;
}


function newUpperArm(shirt_color=default_shirt_color){
	//upper_arm contains the upper limb of the arm and the shoulder. Pivot point is the shoulder

	let upper_arm = new THREE.Group();

	//upper_limb
	let g_upper_limb = new THREE.CylinderGeometry(elbow_radius, shoulder_radius, upper_arm_length);
	let m_shirt = new THREE.MeshLambertMaterial({color: shirt_color});
	let upper_limb = new THREE.Mesh(g_upper_limb, m_shirt);
	upper_limb.position.y = upper_arm_length/2;
	upper_arm.add(upper_limb);

	//shoulder
	let g_shoulder = new THREE.SphereGeometry(shoulder_radius);
	let shoulder = new THREE.Mesh(g_shoulder, m_shirt);
	upper_arm.add(shoulder);

	upper_arm.length = upper_arm_length; //add my own property to the object

	//upper_arm is part of the arm, we add arm to the scene, not upper arm

	return upper_arm;
}

function newArm(){
	//arm contains upper arm, forearm, and sword. Pivot point is the shoulder
	//the main vector is shoulder->hand, default is pointing up. Arm will be rotated with spherical coordinates

	let arm = new THREE.Group();
	
	//let sword = newSword();
	arm.forearm = newForearm();
	arm.upper_arm = newUpperArm();

	arm.add(arm.forearm);
	arm.add(arm.upper_arm);

	//define function for setting elbow angle of arm - elbow points towards negative z
	arm.setElbowAngle = function(elbow_angle){ //assumption that the elbow angle is obtuse, makes arcsin easier to deal with
		
		let f = arm.forearm.length;
		let u = arm.upper_arm.length;
		let dist_shoulder_hand = Math.sqrt( f**2 + u**2 -(2*f*u*Math.cos(elbow_angle)) ); //law of cosines

		let ratio_sine_side = Math.sin(elbow_angle)/dist_shoulder_hand; //this ratio is constant, law of sines

		//set upper arm rotation
		let u_rot = Math.asin(f*ratio_sine_side); //law of sines
		arm.upper_arm.rotation.x = -u_rot;
		
		//set forearm position, rotation
		arm.forearm.position.y = arm.upper_arm.length * Math.cos(u_rot);
		arm.forearm.position.z = - arm.upper_arm.length * Math.sin(u_rot);
		let f_rot = Math.asin(u*ratio_sine_side); //law of sines
		arm.forearm.rotation.x = f_rot;

		//set sword position
		//TODO

	}

	//set up parts of the arm to give the proper elbow angle	
	arm.setElbowAngle(initial_elbow_angle);

	//apply the arm twist
	arm.rotation.y = arm_twist;


	arm.position.z = 50;
	arm.rotation.x = -(2/3)*Math.PI;

	scene.add(arm);
	return arm;
}




//FUNCTIONS OPERATING ON 3D OBJECTS -------------------------------------------------------------------------------------------

//function to get vector hilt->tip of sword
function getSwordVector(sword){ //sword is an Object3D

	//find 3-space pt on sword towards tip, pt towards base, then find vector between them

	let sword_tip = sword.localToWorld( new THREE.Vector3(0,1,0) );
	let sword_base = sword.localToWorld( new THREE.Vector3(0,0,0) );
	return sword_tip.sub(sword_base); //vector from base pt to tip pt, type is THREE.Vector3
}


//function to get vector elbow->hand of forearm
function getForearmVector(forearm){ //forearm is an Object3D

	//return vector pointing away for now
	return new THREE.Vector3(0,1,-1);
}

