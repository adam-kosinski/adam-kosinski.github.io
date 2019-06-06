var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var score_table = document.getElementById("scores");
var score_tr = document.getElementById("score_tr");

//variable to store the p elements displaying players' score
var scores = {}; //color:score
var score_display_generated = false; //only want to generate the score display once, not every match

//variables to store objects
var tanks = []; //Tank objects, defined in tanks.js
var bullets = []; //Bullet objects, defined in bullets.js
var explosions = []; //Explosion objects, defined in explosions.js
var obstacles = []; //Obstacle objects, defined in obstacles.js

//variable to store functions bound to certain keys
//format of each entry is "e.key":{keydown:function, keyup:function prevEvent:"eventType"} //third entry is for efficiently handling key down events that get triggered rapid fire
var keyConfig = {};

//variable to store id of main loop
var mainLoopID;

//variable to store how many milliseconds passed since a tank was destroyed - controls end of match
var tankHitTimer; //if mainLoop detects a tank was hit, it'll start the timer by setting this to 0 and then incrementing every time the mainLoop runs

//variable to store if we're doing the fun version (moving obstacles)
var fun_version = false;
var tried_to_leave; //see events.js with fun version stuff and page unloading logic

//config stuff ----------------------------------------------

var fps = 30;

//bullet stuff
var bulletSpeed = 120; //px per second
var nBullets = 10;
var bulletLife = 8000; //milliseconds until the bullet is removed and the tank that shot it is restocked
var bulletRadius = 3; //px


//explosion stuff
var explosionDuration = 1000; //milliseconds


//tank stuff
var tankSpeed = 100; //px per second
var tankAngularSpeed = Math.PI; //radians per second
var tankHitTimerTimeout = 3000; //milliseconds after first tank is destroyed before game ends

var tankWidth = 20; //px, sideways direction
var tankLength = 30; //px, the forward-backward direction
//note: length must be >= width for non-weird drawings
var tankNozzleExtension = 10; //px the nozzle extends over the base of the tank, must be > 0
var tankIconWidth = 50; //px, width of image sitting next to scores


//obstacle stuff
var obstacleColor = "gray";
var wallWidth = 8; //px; for WallObstacles
var obstacleGrid = []; //filled with 1s (obstacle there), 0s (unused), and -1s (no obstacle allowed there)
var nRows = 8;
var nCols = 8;
var maxUnusedGridSquares = 5; //will stop trying to place obstacles when the number of unused grid squares is less than or equal to this number
var nAttemptsToPlaceObstacle = 5; //number of times an obstacle will pick a random spot to place itself before giving up
//set up obstacle grid
for(let r=0; r<nRows; r++){
	let row = [];
	for(let c=0; c<nCols; c++){
		row.push(0);
	}
	obstacleGrid.push(row);
}

//variables for obstacle motion in fun version
var min_cycle_duration = 5000; //milliseconds
var max_cycle_duration = 15000; //milliseconds
var min_offset = 20; //in pixels
var max_offset = 200; //in pixels



//obstacle type and random generation data
var nObstaclesToGenerate = 20;

var obstacle_types = { //stores every type of pre-defined obstacle under a string name
	/*
	"obstacle":{
		type: "large/wall",
		v_array:[
			
		],
		footprint:[
			
		]
	}
	*/
	"1x1":{
		type: "large",
		v_array:[
			[0,0,0,0],
			[0,1,2,0],
			[0,4,3,0],
			[0,0,0,0]
		],
		footprint:[
			[-1,-1,-1],
			[-1,1,-1],
			[-1,-1,-1]
		]
	},
	"1x2":{
		type: "large",
		v_array:[
			[0,0,0,0],
			[0,1,2,0],
			[0,0,0,0],
			[0,4,3,0],
			[0,0,0,0]
		],
		footprint:[
			[-1,-1,-1],
			[-1,1,-1],
			[-1,1,-1],
			[-1,-1,-1]
		]
	},
	"2x1":{
		type: "large",
		v_array:[
			[0,0,0,0,0],
			[0,1,0,2,0],
			[0,4,0,3,0],
			[0,0,0,0,0]
		],
		footprint:[
			[-1,-1,-1,-1],
			[-1,1,1,-1],
			[-1,-1,-1,-1]
		]
	},
	"1x2_point_1":{
		type: "large",
		v_array:[
			[0,0,0,0],
			[0,1,2,0],
			[0,0,3,0],
			[0,4,0,0],
			[0,0,0,0]
		],
		footprint:[
			[-1,-1,-1],
			[-1,1,-1],
			[-1,1,-1],
			[-1,-1,-1]
		]
	},
	"parallelogram":{
		type: "large",
		v_array:[
			[0,0,0,0,0],
			[0,1,2,0,0],
			[0,0,4,3,0],
			[0,0,0,0,0]
		],
		footprint:[
			[-1,-1,-1,-1],
			[-1,1,1,-1],
			[-1,-1,-1,-1]
		]
	},
	"cool_1":{
		type: "large",
		v_array:[
			[0,0,0,0,0,0],
			[0,0,1,0,0,0],
			[0,0,0,0,2,0],
			[0,4,0,3,0,0],
			[0,0,0,0,0,0]
		],
		footprint:[
			[-1,-1,-1,-1,-1],
			[-1,-1,1,1,-1],
			[-1,-1,1,1,-1],
			[-1,-1,-1,-1,-1]
		]
	},
	"horiz_wall_1":{
		type: "wall",
		v_array:[
			[0,0],
			[1,2],
			[0,0]
		],
		footprint:[
			[-1],
			[-1]
		]
	},
	"vert_wall_1":{
		type: "wall",
		v_array:[
			[0,1,0],
			[0,2,0]
		],
		footprint:[
			[-1,-1]
		]
	}
};

var obstacle_demographic = [ //to determine what obstacle to draw next, the program randomly picks from this array - more frequent obstacles are more likely to be picked
	/*"1x1",
	"1x2",
	"2x1",
	"1x2_point_1",
	"parallelogram",
	"cool_1",*/
	"horiz_wall_1",
	"horiz_wall_1",
	"vert_wall_1",
	"vert_wall_1"
];