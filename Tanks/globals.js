var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

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

//config stuff ----------------------------------------------
var tankSpeed = 100; //px per second
var tankAngularSpeed = Math.PI; //radians per second
var bulletSpeed = 120; //px per second

var bulletLife = 8000; //milliseconds until the bullet is removed and the tank that shot it is restocked
var explosionDuration = 1000; //milliseconds

var tankWidth = 20; //px, sideways direction
var tankLength = 30; //px, the forward-backward direction
//note: length must be >= width for non-weird drawings
var tankNozzleExtension = 10; //px the nozzle extends over the base of the tank, must be > 0
var bulletRadius = 3; //px

var obstacleColor = "gray";

var fps = 30;