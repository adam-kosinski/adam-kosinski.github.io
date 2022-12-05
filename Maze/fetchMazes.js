// store the names of the files to get later - first one is the default maze
var filenames = [
    "Joseph's_50x70_Maze.txt",
    "Adam's_30x30_Maze.txt",
    "The_10x10_Test_Maze.txt",
    "Adrian's_50x50_Maze.txt",
    "Anna's_40x40_Maze.txt",
    "Joseph's_Random_Maze.txt"
];

//add the 'MAZES' folder in front of every file name
for(var i = 0; i < filenames.length; i++) {
    filenames[i] = "MAZES/" + filenames[i];
}


var files = [];
var firstFileLoaded = false; //flag for setting default value

// when the page loads, fetch all the files and store them in 'files' array, set maze variable and display maze name
window.onload = function() {
    for(var i = 0; i < filenames.length; i++) {
        readTextFile(filenames[i],i);
    }
    
    //set default maze and mazeName
    //check if first file was loaded before setting these values
    var intervalID = setInterval(function() {
        if(firstFileLoaded) {
            maze = extractMazeFromString(files[0][0]);
            
            //* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
            executeMazeJSFile(); //only do the maze.js file after the maze array has been set * * * * * * * * * * * * * * * * * * * * * * * 
            //* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
                //stars to highlight where this function is called
            
            clearInterval(intervalID);
        }
    },25);
};


// define file reading function
function readTextFile(origFile,index) {
    
    //replace possible apostrophes in 'file' so that it's a valid URL
    file = origFile.replace(/'/g,"&%2339%3b"); //don't override origFile so that I can access it later when setting the mazeName
    
    //create a new XMLHttpRequest
    var fileRequest = new XMLHttpRequest();
    
    // specify the function to call every time the state of the request changes -- test if it reached 4 (the finished state)
    fileRequest.onreadystatechange = function() { //NOTE: 'fileRequest' is not a reserved name; any variable name will turn purple there
    
        // if request done, check if the fetch worked by checking the 'status' object (ex. 404 means not found, 200 means OK, etc.)
        if(fileRequest.readyState === 4) {
            
            if(fileRequest.status === 200 || fileRequest.status === 0) { // 'OK' might be 200 or 0 for diff. browsers
            
                // get response text
                var fileText = fileRequest.responseText;
                
                //get name of maze
                var mazeName = convertToName(origFile);
                
                //add that information into the files array
                files[index] = [fileText, mazeName];
                
                //set firstFileLoaded to true if the index was zero
                if(index === 0) {
                    firstFileLoaded = true;
                }
                
                //if done with all files, put stuff into select element
                if(index === filenames.length - 1) {
                    fillMazeSelector();
                }
            }
        }
    };
    
    //specify the request information - syntax: .open(method of request, where to find the file, async -- true if async
    fileRequest.open("GET", file, true);
        //has to be synchronous (everything waits for request to finish) so that the program won't try to set default maze and mazeName before the file was processed
    
    //send the request
    fileRequest.send();
}


// function for extracting the maze name from the file path
function convertToName(file) {
    
    //define regular expression for isolating the file name
    var re = /[\w']+(?=.txt)/g; //the "g" is a flag saying to look everywhere
        /* explanation:
        
        [\w'] - will match any alphanumeric character: letter, number, or underscore, as well as apostrophes for maze ownership
        \w+ - adding the plus matches any consecutive alphanumeric characters (1 or more characters)
        \w+(?=.txt) - x(?=y) matches x if it's followed by y. Therefore, this regexp matches any set consecutive alphanumeric characters that's followed by ".txt"
        
        */
    
    //isolate file name
    var filename = re.exec(file)[0]; //.exec returns an array, hence the [0]
    
    //replace all underscores in the filename with spaces
    filename = filename.replace(/_/g, " ");
    
    //return filename
    return filename;
}





function fillMazeSelector() {
    for(var i = 0; i <= files.length; i++) {
        // create new option
        var option = document.createElement("option");
        
        // determine what to put in the option
        var stuff;
        if(i < files.length) {
            stuff = files[i][1];
        } else {
            stuff = "A Custom Maze";
        }
        
        // set value and text
        option.value = stuff;
        option.innerText = stuff;
        
        //append option to list
        document.getElementById("mazeSelector").appendChild(option);
    }
}









// function to convert string into a maze array
    // code for this function borrowed from mazeCreator.js
    
    function extractMazeFromString(dataString) {
        var returnArray = [];
        
        dataString = dataString.substring(0,dataString.length - 1); //takes off one from end in case extra 'enter' (line break) there
        
            //EXTRACT ARRAY FROM DATASTRING >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            //figure out how many items in each row----------------------
        var splitString = dataString.split(",");
        var itemsPerRow;
        var keepChecking = true;
    
        for(var q = 0; keepChecking; q++) {
            for(var i = 0; i < splitString[q].length; i++) {
                if(splitString[q][i] === "]") {
                    itemsPerRow = q + 1;
                    keepChecking = false;
                    break;
                }
            }
        }
        
            //extract numbers from dataString--------------------
        var numberStorageArray = [];
        for(var x = 0; x < dataString.length; x++) {
            if(!isNaN(dataString[x])) {numberStorageArray.push(Number(dataString[x]))}
        }
            //remove extras in numberStorageArray
        for(var e = 0; e < dataString.length; e += itemsPerRow) {
            numberStorageArray.splice(e,1);
        }
        
            //put numbers into array----------------------
        var indexTracker = 0;
        for(var r = 0; indexTracker < numberStorageArray.length; r++) {
            var arrayRow = [];
            for(var c = 0; c < itemsPerRow; c++) {
                arrayRow.push(numberStorageArray[indexTracker]);
                indexTracker++;
            }
            returnArray.push(arrayRow);
        }
        
        return returnArray;
    }