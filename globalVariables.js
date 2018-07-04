var clues; //stores information presented to user, used to solve the nonogram
			//contains two properties, 'rows' and 'cols'

var nonogram = []; //stores user input:
				// -1 = x
				//  0 = unmarked
				//  1 = marked

var name = "";

var enteringData = false;
var dataToEnter;

var dialogOpen = true; //create/upload/download, theme choosing, info screen, etc.
var nonogramLoaded = false; //flags whether there's currently a nonogram to work with, so stuff like keypress doesn't trigger prematurely
var hoveringOverBorder = false; //used in enterNonogram.js to decide whether a click is for inserting a row/col or for entering clue data

var nonogramHistory = [];
var nonogramFuture = [];

//used in table.js under the mousemove handler
//to prevent fast mousemove events from entering data too quickly
var prevMousemoveTarget;
var mousemoveTimerId;
var mousemoveTimerDone = false;
var timeoutTime = 50; //milliseconds


//solving variables
var solving = false;
var anythingChanged = true; //used in the solving algorithm to determine when to stop looping
var contradiction = false;
var solutions = []; //stores solutions if it's not certain if there is a unique one


/*specific variables

input - used in upload.js to upload files
clueInputter - used in enterNonogram.js to input clue data

*/


var dbg = false;