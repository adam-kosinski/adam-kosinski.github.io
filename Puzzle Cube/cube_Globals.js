var GUI_Editable = true;

var nOfParts = 0;
var nOfCubesEntered = 0; //'cubes' refers to subcubes

var puzzleL = 3; //'puzzle' refers to the overall assembled puzzle
var puzzleW = 3;
var puzzleH = 3;

var parts = []; //index in this array is equivalent to part number
var partsInfo = []; //stores n of cubes and color for each of the parts
var partsOrientations = []; //indices correspond to those of parts (i.e. array[partNumber])
var cubeLocations = []; //indices correspond to those in partsOrientations (i.e. array[part][orientation])

var assemblyOrder = [];

var solutions = [];

var isoCubeSideLength = 50; //in pixels



var inputCommandStorage = ""; //stores all the commands needed to input the same parts with functions as were entered manually, expedites programming w/ page refreshes




function resetGlobalVariables(){ //reset variables used in solving
	partsOrientations = [];
	cubeLocations = [];
	assemblyOrder = [];
	solutions = [];
}