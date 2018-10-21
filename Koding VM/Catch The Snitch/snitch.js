/*<<<<<<<<<< SET UP FIELD >>>>>>>>>>>>>>>>>>>>>>>>>>*/

//get references
var field = document.getElementById("field");
var snitch = document.getElementById("snitch");
var leftWing = document.getElementById("leftWing");
var rightWing = document.getElementById("rightWing");
var clickRegion = document.getElementById("clickRegion");
var ballPicture = document.getElementById("ballPicture");


//deal with field size - put below scalar declaration later
function resizeField(){
	field.style.height = window.innerHeight + "px";
	field.style.width = window.innerWidth + "px";
}
resizeField(); //set field to intial window dimensions


//deal with snitch size and styling
var snitchSize = 50; //diameter of ball part of snitch in px

snitch.style.width = snitchSize+"px";
snitch.style.height = snitchSize+"px";
clickRegion.style.width = snitchSize+"px";
clickRegion.style.height = snitchSize+"px";
clickRegion.style.borderRadius = snitchSize/2 + "px";

ballPicture.style.width = snitchSize+"px";
ballPicture.style.height = snitchSize+"px";
ballPicture.firstElementChild.style.width = snitchSize+"px";
ballPicture.firstElementChild.style.height = snitchSize+"px";

leftWing.style.width = snitchSize + 2*(snitchSize*1.25) + "px" //width is ball plus twice the established 'width' of the wing
leftWing.style.left = -(snitchSize*1.25)+"px" //offset it by wing width
rightWing.style.width = snitchSize + 2*(snitchSize*1.25) + "px"
rightWing.style.left = -(snitchSize*1.25)+"px"

/*<<<<<<<<<<<<<<< SNITCH MOVEMENT >>>>>>>>>>>>>>>>>>*/
var isSnitchCaught = false;
var fps;
function updateFps(newFps){
	fps = newFps;
	snitch.style.transitionDuration = 1000/fps + "ms";
}
updateFps(6);
var scalar = 10; //px per frame, essentially scaling factor b/c default is to move snitch one pixel, dilate the screen to move more per frame


//initialize snitch position
var maxYOffset = Math.floor((window.innerHeight - snitchSize)/scalar);
var maxXOffset = Math.floor((window.innerWidth - snitchSize)/scalar);
var topOffset = 1 + Math.floor(Math.random()*(maxYOffset-2)); //1+ and minus 2 so that position is safe regardless of cDir
var leftOffset = 1 + Math.floor(Math.random()*(maxXOffset-2)); //(there will be a valid dir regardless of cDir if snitch not at min/max offset)
snitch.style.top = topOffset*scalar + "px";
snitch.style.left = leftOffset*scalar + "px";

//mouse coords
var mX;
var mY;
function handleMouseMove(e){
	mX = e.pageX;
	mY = e.pageY;
}
field.addEventListener("mousemove",handleMouseMove);

var Dirs /*directions*/ = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]; //[x,y], array rotates clockwise (to right) from standard position
var cDir = Math.floor(Math.random()*8); //current direction - stored as a number 0-7 corresponding to an array in Dirs
										//need to initialize b/c pickDirection uses cDir to determine new direction


/*<<<<<<<<<<<<<<<<<<<< SNITCH MOVEMENT CONTROL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.*/
var mode = "idle"; //'idle' or one of the runaway modes
var runawayModes = ["straight","spiralLeft","spiralRight","zigzag","uTurn"];
	//not including "escapeWall", which is a different, special type of runaway mode
	
var escapeWallFrom = 2; //if snitch this many or less px from wall during a runaway mode, should do escape wall mode
var escapeWallTo = 10 //if snitch this many pixels away from wall during a runaway mode, should exit escape wall mode

function moveSnitch(){ //interval function, called periodically over time
	if(isSnitchCaught){return}
	
	//examine distance to mouse, set mode accordingly
	if(mX && mY){sizeUpDistance()}
	
	//pick a direction; change cDir
	cDir = pickDirection();
	
	console.log("  cDir:"+cDir);
	
	//change style (display)
	snitch.style.left = (leftOffset + Dirs[cDir][0])*scalar + "px";
	snitch.style.top = (topOffset + Dirs[cDir][1])*scalar + "px";
	
	//change variables
	leftOffset += Dirs[cDir][0];
	topOffset += Dirs[cDir][1];
	
	//increment runaway counter if running away
	if(mode !== "idle"){runawayCounter++}
	
	setTimeout(moveSnitch,1000/fps);
}

moveSnitch();



function distanceToMouse(x,y){ //x and y based on non-scaled coordinates (leftOffset and topOffset are also based on non-scaled coords)
	var dx = (x*scalar)+(snitchSize/2) - mX; //snitch center coord minus mouse coord
	var dy = (y*scalar)+(snitchSize/2) - mY;
	
	return Math.sqrt(dx*dx + dy*dy); //pythag/distance formula
}

function minDistToWall(x,y){ //x and y are non-scaled coords
	var dists = [
		y, //top
		x, //left
		maxXOffset-x, //right
		maxYOffset-y]; //down
	
	//sort numerically ascending
	dists.sort(function(a,b){return (a-b)});
	
	return dists;
}


var runawayCounter = 0; //number of frames that current runaway mode has been used, incremented in moveSnitch() if mode !== 'idle'
var runawayLength = 0; //intended number of frames to use current runaway mode

function sizeUpDistance(){
	var dist = distanceToMouse(leftOffset, topOffset);
	
	if(dist < 300){ //runaway mode triggered
		if(dist < 200){updateFps(24)}
		else{updateFps(12)} //update animation to match new fps
		
		wallDist = minDistToWall(leftOffset,topOffset)[0];
		if(wallDist <= escapeWallFrom || (mode === "escapeWall" && wallDist <= escapeWallTo)){
			mode = "escapeWall";
			console.log("escaping wall * * * * * * * * * * * * * * * ");
		} else if(runawayCounter === runawayLength || mode === "escapeWall"){
			//pick new random runaway mode from runawayModes array
			mode = runawayModes[Math.floor(Math.random()*(runawayModes.length))];
			
			if(onlyStraightRunaway){mode = "straight"} //overwrite mode if flag is set to true (javascript for this found at bottom of script)
			
			console.log(mode)
			//reset counter to 0
			runawayCounter = 0;
			
			//pick semi-random amount of frames -> runawayLength
			runawayLength = 30;
		}
		//console.log("Close proximity ------------------" + Math.floor(dist));
	} else {
		updateFps(6);
		mode = "idle";
		runawayCounter = 0;
		runawayLength = 0;
		//console.log("Idle mode >>>>>>>>>>>>>>>>>>>>>>>>" + Math.floor(dist));
	}
}

/* <<<<<<<<<<<< PICK DIRECTION STUFF (INCLUDES MOVEMENT ALGORITHMS) >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.*/
var priDir = []; //priority directions, updated each frame based on current movement algorithm, will contain same dirs as posDir
function evalPriDir(){ //returns lowest-index (highest priority) valid direction in priDir
	for(var i=0; i<3; i++){
		if(isDirValid(priDir[i])){return priDir[i]}
	}
}

function pickDirection(){
		//determine possible directions, indexes - 0:left, 1:same, 2:right
	var posDir = [];
	posDir.push(cDir-1 < 0 ? 7 : cDir-1);   //turn left
	posDir.push(cDir);						//continue straight
	posDir.push(cDir+1 > 7 ? 0 : cDir+1);   //turn right
	//console.log("posDir for below cDir: "+posDir);
	
	//function that orders posDir based on how to most efficiently turn to go in a given desired direction - only used for mode="straight"; other modes manually order priDir
	function getPriDirForDir(dir){
		var output = posDir.slice();
		output.sort(function(a,b){ //compare "closeness" of each direction to the desired direction in 'output' aka posDir, sort closenesses numerically ascending
			var A_closeness = Math.min(Math.abs(dir-a), Math.abs((8+a)-dir));
			var B_closeness = Math.min(Math.abs(dir-b), Math.abs((8+b)-dir));
			return A_closeness - B_closeness;
		});
		return output;
	}
	
	/*RUNAWAY MODES*/
	if(mode === "straight"){
		//get deltas based on scaled coordinates
		var dx = (leftOffset*scalar)+(snitchSize/2) - mX; //snitch center coord minus mouse coord
		var dy = (topOffset*scalar)+(snitchSize/2) - mY;
		
		var radius = distanceToMouse(leftOffset,topOffset); //radius of imaginary circle used for trig in a moment
		
		//dx or dy /radius -> sin value, if abs val of angle value is less than 22.5 deg (pi/8), heading is within the 45 deg arc corresponding to horiz/vert.
		if(Math.asin(Math.abs(dx/radius)) < Math.PI/8){ //up or down
			if(dy >= 0){priDir = getPriDirForDir(2)} //down, 'or equal to' is arbitrary
			if(dy <  0){priDir = getPriDirForDir(6)} //up
		} else if(Math.asin(Math.abs(dy/radius)) < Math.PI/8) { //left or right
			if(dx >= 0){priDir = getPriDirForDir(0)} //right
			if(dx <  0){priDir = getPriDirForDir(4)} //left
		} else { //diagonal
			if(dx>0 && dy>0){priDir = getPriDirForDir(1)} //down-right
			if(dx<0 && dy>0){priDir = getPriDirForDir(3)} //down-left
			if(dx<0 && dy<0){priDir = getPriDirForDir(5)} //up-left
			if(dx>0 && dy<0){priDir = getPriDirForDir(7)} //up-right
		}
		
		return evalPriDir();
	}
	if(/^spiral/.test(mode)){ //if mode begins w/ 'spiral'
		var vrDir = mode === "spiralLeft" ? posDir[0]: posDir[2]; //veer direction
		var otherDir = mode === "spiralLeft" ? posDir[2]: posDir[0]; //opposite turning direction to vrDir
		
		var vrDist = distanceToMouse(leftOffset+Dirs[vrDir][0], topOffset+Dirs[vrDir][1]); //veer dist (dist after move one in vrDir)
		var straightDist = distanceToMouse(leftOffset+Dirs[posDir[1]][0], topOffset+Dirs[posDir[1]][1]); //dist after move one in cDir
		var cDist = distanceToMouse(leftOffset, topOffset); //current distance from mouse
		
		//if vrDist is closer to mouse than current position (before move), and is also closer than going straight, make straight the priority
		if(vrDist<cDist && vrDist<straightDist){
			priDir = [posDir[1],vrDir,otherDir];
		} else{
			priDir = [vrDir,posDir[1],otherDir]; //otherwise, make veer direction the priority
		}
	
		return evalPriDir();
	}
	if(mode === "zigzag"){
		let nOfFrames = 5; //number of frames between turns
		if(runawayCounter % (nOfFrames*2) === 0){ //every other multiple of nOfFrames
			priDir = posDir; //turn left as priority (posDir already structured: left, straight, right)
		} else if (runawayCounter % nOfFrames === 0){ //other multiples of nOfFrames
			priDir = [posDir[2],posDir[1],posDir[0]]; //turn right
		} else {
			priDir = [posDir[1],posDir[0],posDir[2]]; //go straight
		}
		
		return evalPriDir();
	}
	if(mode === "uTurn"){
		//turn left for the first four frames, continue straight afterwards
		if(runawayCounter < 4){priDir = posDir} //posDir already structured: left,straight,right
		else {priDir = [posDir[1],posDir[0],posDir[2]]}
		
		if(runawayCounter === 13){runawayCounter = runawayLength - 1}
			//10 frames after finish uTurn, change mode (the -1 is b/c runawayCounter is incremented in moveSnitch()
			//after pickDirection (this function) is called
		
		return evalPriDir();
	}
	if(mode === "escapeWall"){
			//loop through posDir, determine which is valid and maximizes sum of distToWall squared plus distToMouse
		var currentBestDir;
		var currentBestSum = -Infinity;
		for(var i=0; i<3; i++){
			if(!isDirValid(posDir[i])){continue}
			
			//determine new coords
			let x = leftOffset + Dirs[posDir[i]][0];
			let y = topOffset + Dirs[posDir[i]][1];
			
			//get distances after potential movement
			let distToWall = minDistToWall(x,y)[0];
			let distToMouse = distanceToMouse(x,y)/scalar; //distanceToMouse returns scaled coords
			
			let sum = distToWall*distToWall + distToMouse; //squaring makes maximizing wall distance a priority over mouse distance
			if(sum > currentBestSum){
				currentBestDir = posDir[i];
				currentBestSum = sum;
			}
		}
		
		return currentBestDir;
	}
	
	/*IDLE MODE*/
	if(mode === "idle"){
			//pick random direction
		var pickArray = [0,1,2];
		do{
			var testPick = pickArray.splice(Math.floor(Math.random()*pickArray.length), 1)[0]; //splice out a random element,
																								//FYI: array.splice() returns an array of deleted elements
		} while(!isDirValid(posDir[testPick])); //keep trying if direction isn't valid
		
		return posDir[testPick];
	}
}

function isDirValid(dir){
		//coords (offsets) for testing
	var x = leftOffset;
	var y = topOffset;
	
	//console.log("  isDirValid, dir: "+dir);
		//move one in chosen direction
	x += Dirs[dir][0];
	y += Dirs[dir][1];
	
		//if moving -> land outside of field, not valid
	if(x<0 || x>maxXOffset || y<0 || y>maxYOffset){return false}
	
		//if diagonal movement (more efficient to check before vert/horz. b/c that one requires incrementing a second time)
	if(Math.abs(Dirs[dir][0])===Math.abs(Dirs[dir][1]) && Math.abs(Dirs[dir][1])>0){ //if abs vals of dx and dy are equal and greater than 0, it's diagonal mvmt
			//determine distances to 2 borders that we are moving towards
		var hDistAway = Dirs[dir][0] < 0 ? x : maxXOffset-x;
		var vDistAway = Dirs[dir][1] < 0 ? y : maxYOffset-y;
		
			//after moved once (which we test did earlier), should have at least 2 units away from one of the borders moving towards
		if(Math.max(hDistAway,vDistAway) < 2){return false}
	}
	
		//if vertical movement
	else if(Math.abs(Dirs[dir][0]) !== Math.abs(Dirs[dir][1])){
			//move testing position a second time in direction
			//if outside after, means first movement ran it headfirst into the wall
		x += Dirs[dir][0];
		y += Dirs[dir][1];
		if(x<0 || x>maxXOffset || y<0 || y>maxYOffset){return false}
	}
	
		//if passed all checks, it's good to go!
	return true;
}


/*<<<<<<<<<<< CATCH SNITCH >>>>>>>>>>>>>>>>>>>>*/
function caughtSnitch(){
	isSnitchCaught = true;
	console.log("Snitch is caught!");
}

clickRegion.addEventListener("click",caughtSnitch);

/*<<<<<<<<<<<<<<<<<<<< ONLY STRAIGHT RUNAWAY >>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
var onlyStraightRunaway = true; //default is true

//use (dblclick + shift) event to toggle
document.addEventListener("dblclick",function(e){
	if(e.shiftKey){
		if(onlyStraightRunaway){
			onlyStraightRunaway = false;
			blinkTitle("TRICKY MODE");
		} else {
			onlyStraightRunaway = true;
			blinkTitle("NATURAL MODE");
		}
	}
});

var timeoutID; //global to allow clearing of first blinking if blinkTitle is called twice in overlapping time periods
var title = document.getElementsByTagName("title")[0];
var titleText = title.textContent; //store current title text so can reset to normal later
function blinkTitle(textToBlink){
	if(timeoutID){clearTimeout(timeoutID)};
	
	//set parameters
	var nOfBlinks = 3;
	var timePerBlink = 1500; //ms
	
	//define functions to be called at timeouts
	var displayText = function(){
		if(nOfBlinks){
			title.textContent = textToBlink;
			nOfBlinks--;
			timeoutID = setTimeout(hideText, timePerBlink/2);
		} else {
			title.textContent = titleText;
		}
	}
	var hideText = function(){
		title.textContent = "=========================================="; //Must have something, might as well make it big to attract attention
		timeoutID = setTimeout(displayText, timePerBlink/2);
	}
	
	//execute blink
	displayText();
}