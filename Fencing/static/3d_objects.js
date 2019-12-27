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

//function to get vector hilt->tip of sword
function getSwordVector(sword){ //sword is an Object3D

	//find 3-space pt on sword towards tip, pt towards base, then find vector between them

	let sword_tip = sword.localToWorld( new THREE.Vector3(0,1,0) );
	let sword_base = sword.localToWorld( new THREE.Vector3(0,0,0) );
	return sword_tip.sub(sword_base); //vector from base pt to tip pt, type is THREE.Vector3
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

	//forearm is part of the arm, don't add it to the scene yet

	return forearm;
}






//function to get vector elbow->hand of forearm
function getForearmVector(forearm){ //forearm is an Object3D

	//return vector pointing away for now
	return new THREE.Vector3(0,1,-1);
}
