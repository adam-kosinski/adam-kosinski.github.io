// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< PRELIMINARY STUFF >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var maze = [];

var endRegion;
var sideRegionLength;
var middleRegionLength;

var frozen;
var positionRow;
var positionCol;



function doPreliminaryStuff() {
    sideRegionLength = Math.floor(maze.length / 3);
    middleRegionLength = maze.length - (2 * sideRegionLength);
    
    //determine region of end location
    for(var r = 0; r < maze.length; r++) {
        for(var c = 0; c < maze[r].length; c++) {
            if(maze[r][c] === 3) { //if found the end, figure out which region
            console.log("r: ",r,"c: ",c);
                if(r >= (sideRegionLength + middleRegionLength)) {
                    if(c >= (sideRegionLength + middleRegionLength)) {endRegion = "bottom right"}
                    else if (c >= sideRegionLength) {endRegion = "bottom middle"}
                    else if (c >= 0) {endRegion = "bottom left"}
                    
                } else if (r >= sideRegionLength) {
                    if(c >= (sideRegionLength + middleRegionLength)) {endRegion = "middle right"}
                    else if (c >= sideRegionLength) {endRegion = "center"}
                    else if (c >= 0) {endRegion = "middle left"}
                    
                } else if (r >= 0) {
                    if(c >= (sideRegionLength + middleRegionLength)) {endRegion = "top right"}
                    else if (c >= sideRegionLength) {endRegion = "top middle"}
                    else if (c >= 0) {endRegion = "top left"}
                }
            }
        }
    }
    
    
    
    var instructions =
        "Use the arrow keys or 'WASD' keys to move.<br><br>The goal is to get from the green square to the red square, \
        which is located in the " + endRegion + " region of the maze. At any given time, only a 5x5 region \
        of the full maze is visible.";
    
    document.getElementById("instructions").innerHTML = instructions;
    
    
    frozen = true;
        //determine start position
    for(var r = 0; r < maze.length; r++) {
        for(var c = 0; c < maze[r].length; c++) {
            if(maze[r][c] === 2) {
                positionRow = r;
                positionCol = c;
            }
        }
    }
    console.log("position: ",positionRow,positionCol);
}

function executeMazeJSFile() {
    doPreliminaryStuff();
    
     //<<<<< EVENT LISTENER FOR MAZE SELECTOR >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
    //event listener for mazeSelector
    var mazeSelector = document.getElementById("mazeSelector");
    mazeSelector.addEventListener("change",function(){
        
        // if custom maze, get custom maze
        if(mazeSelector.value === "A Custom Maze") {
            document.getElementById("mazeEnterContainer").style.display = "block";
            
        } else { //otherwise, proceed normally
            switchMaze(mazeSelector.value);
        }
    });
    
    //<<<<< LOAD SCREEN STUFF >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
        //load start screen
    document.getElementById("instructions").style.display = "block";
    document.getElementById("start").style.display = "block";
    document.getElementById("whichMaze").style.display = "block";
    
    
    
    document.getElementById("start").addEventListener("click",loadGame);
    
    function loadGame() {
        document.getElementById("start").style.display = "none";
        document.getElementById("instructions").style.display = "none";
        document.getElementById("whichMaze").style.display = "none";
        document.getElementById("maze").style.display = "block";
        document.getElementById("quit").style.display = "block";
        
        updateMaze();
        
        frozen = false;
    }
    
    
    
    document.getElementById("backToStart").addEventListener("click",reset);
    document.getElementById("quit").addEventListener("click",reset);
    
    function reset() {
        document.getElementById("youWon").style.display = "none";
        document.getElementById("maze").style.display = "none";
        document.getElementById("quit").style.display = "none";
        
        for(var r = 0; r < maze.length; r++) { //reset position variables
            for(var c = 0; c < maze[r].length; c++) {
                if(maze[r][c] === 2) {
                    positionRow = r;
                    positionCol = c;
                }
            }
        }
        
        document.getElementById("instructions").style.display = "block";
        document.getElementById("start").style.display = "block";
        document.getElementById("whichMaze").style.display = "block";
    }
    
    
    
    document.getElementById("submitMaze").addEventListener("click",submitCustomMaze);
    
    function submitCustomMaze() {
        // get input value
        var textarea = document.getElementById("mazeEnter");
        var mazeInput = textarea.value;
        
        //get new maze
        try {
            var extractedArray = extractMazeFromString(mazeInput);
            switchMaze(null,extractedArray); //no need to specify maze name for search, we're using the optionalMaze argument
            
            //hide custom maze display
            document.getElementById("mazeEnterContainer").style.display = "none";
            
            //clear mazeEnter textarea
            textarea.value = "";
            
        } catch(err) {
            //display error message
            var message = document.getElementById("errorNotifier");
            message.style.display = "block";
            
            //start fade animation
            var fadeTime = 2000;
            var timeLeft = fadeTime;
            var intervalID = setInterval(function(){
                
                var opacity = timeLeft / fadeTime;
                message.style.opacity = opacity;
                
                if(opacity <= 0) {
                    clearInterval(intervalID);
                    message.style.display = "none";
                }
                
                timeLeft -=100;
                
            }, 100);
            
        }
        
    }
    
    
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< GAME PLAYING STUFF >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
    function updateMaze() {
        var rRef; //maze array row index
        var cRef; //maze array col index
        
        for(var tRow = 1; tRow <= 5; tRow++) { //iterate through 5 visible rows
            rRef = positionRow + (tRow - 3);
            
            for(var tCol = 1; tCol <=5; tCol++) { //iterate through 5 visible cols
                cRef = positionCol + (tCol - 3);
                
                var tableCell = document.getElementById(tRow + "a" + tCol);
                
                var mazeColorRef;
                mazeColorRef = undefined;
                
                if((rRef >= 0 && rRef < maze.length) && (cRef >= 0)) {mazeColorRef = maze[rRef][cRef]}
                // extra check for if row is legitimate because maze[rRef] returns undefined
                // and throws an error, while when rRef is legitimate and cRef is not, maze[rRef]
                // references the row, and the unlegitimate cRef value makes the whole thing undefined,
                // with no error -- need to be especially careful with row, because it has potential to
                // throw an error if not correct
                
                switch(mazeColorRef) { //change background color
                    case 0: tableCell.style.backgroundColor = "white"; break;
                    case 1: tableCell.style.backgroundColor = "gray"; break;
                    case 2: tableCell.style.backgroundColor = "green"; break;
                    case 3: tableCell.style.backgroundColor = "red"; break;
                    default: tableCell.style.backgroundColor = "#333333"; break;
                }
            }
        }
        
            //check for if player won
        var endRow;
        var endCol;
        for(r = 0; r < maze.length; r++) {
            for(c = 0; c < maze[r].length; c++) {
                if(maze[r][c] === 3) {
                    if(r === positionRow && c === positionCol) {youWin()}
                }
            }
        }
    }
    
    
    document.body.addEventListener("keydown",keyDown);
    
    function keyDown(e) {
        switch(e.key) {
            case "w":
            case "ArrowUp": moveAvatar(-1,0); break;
            case "a":
            case "ArrowLeft": moveAvatar(0,-1); break;
            case "s":
            case "ArrowDown": moveAvatar(1,0); break;
            case "d":
            case "ArrowRight": moveAvatar(0,1); break;
        }
    }
    
    function moveAvatar(vertical,horizantal) {
        
        if(frozen) {return}
        
        var checkColor;
        checkColor = undefined;
        
        
        
        if((positionRow + vertical) < maze.length && (positionRow + vertical) >= 0) { //similar reasoning to above
            checkColor = maze[positionRow + vertical][positionCol + horizantal];
            
            if(checkColor === 0 || checkColor === 2 || checkColor === 3) {
                positionRow += vertical;
                positionCol += horizantal;
                updateMaze();
            }
        }
    }
    
    function youWin() {
        frozen = true;
        document.getElementById("quit").style.display = "none";
        document.getElementById("youWon").style.display = "block";
    }
}














// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< CHANGE MAZE STUFF >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    
    // function for changing the maze
    
    function switchMaze(mazeName, optionalMaze) { //optionalMaze is so that someone can input maze code from mazeCreator w/o editing files
        if(optionalMaze) {
            //set maze to optionalMaze if type is an array
            if(typeof optionalMaze === "object") {
                maze = optionalMaze;
                doPreliminaryStuff();
            }
        } else {
            
            // loop through 'files' array and look for a match to the maze name
            // for(var i = 0; i < files.length; i++) {
            //     if(files[i][1] === mazeName) {
            //         // if match, change maze, change display on start screen, redefine the variables and stop this function
            //         maze = extractMazeFromString(files[i][0]);
            //         doPreliminaryStuff();
            //         return;
            //     }
            // }

            maze = MAZES[mazeName];
            doPreliminaryStuff();
        }
    }