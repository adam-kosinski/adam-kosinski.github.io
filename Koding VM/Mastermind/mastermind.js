function determineCode() {
    for(var codeHole = 1; codeHole <= 4; codeHole++) {
        var codeColor = Math.ceil(Math.random()*6);
        var referenceHole = document.getElementById("solution" + codeHole);
        
        switch(codeColor) {
            case 1: codeColor = "teal"; break;
            case 2: codeColor = "yellow"; break;
            case 3: codeColor = "orange"; break;
            case 4: codeColor = "white"; break;
            case 5: codeColor = "purple"; break;
            case 6: codeColor = "mediumvioletred"; break;
        }
        
        code.push(codeColor);
        referenceHole.style.backgroundColor = codeColor;
    }
    
        //since this has onload, do indicator canvas thing
    drawIndicator("indicator")
}

var code = [];
var currentRow = [0,0,0,0];
var rowNumber = 1;
var color = "none";

var doNotCheck = false;



function changeColor(whichColor) {
    var colorArray = document.getElementById("colorChoice").childNodes;
    for(var i = 1; i < 12; i += 2) { //clear any other colors
        colorArray[i].style.backgroundColor = "";
    }
    
    if(color !== whichColor) {
        color = whichColor;
        document.getElementById(whichColor).style.backgroundColor = "rgba(255,255,255,0.5)";
    } else {
        color = "none";
        document.getElementById(whichColor).style.backgroundColor = "";
    }
}

function dropPeg(holeId) {
    var holeRow = holeId.split("a")[0];
    var holePosition = holeId.split("a")[1];
    if(holeRow != rowNumber) {return}
    
    if(color !== "none") {
        document.getElementById(holeId).style.backgroundColor = color;
        currentRow[holePosition - 1] = color;
    } else {
        document.getElementById(holeId).style.backgroundColor = "mediumblue";
        currentRow[holePosition - 1] = 0;
    }
}

function checkGuess() {
    if(doNotCheck) {return}
    for(var x = 0; x < 4; x++) {
        if(currentRow[x] === 0) {
            alert("You must fill in the whole row before submitting.");
            return;
        }
    }
    
    var codeCheck = code.slice();
        //figure out feedback
    var pegResult = [0,0,0,0];
    for(var h = 0; h < 4; h++) { //check for red pegs
        if(currentRow[h] === codeCheck[h]) { //if red peg
            pegResult[h] = 2;
            codeCheck[h] = undefined;
        }
    }
    
    for(h = 0; h < 4; h++) { //check for white pegs
        if(pegResult[h] === 2) {continue} //if it was already marked as red
        for(var c = 0; c < 4; c++) {
            if(currentRow[h] === codeCheck[c]) {
                pegResult[h] = 1;
                codeCheck[c] = undefined;
                break;
            }
        }
    }
    
        //scramble order and display
    var feedback = [];
    for(var r = 1; r <= 4; r++) {
        var indexRemove = Math.floor(Math.random() * pegResult.length);
        var removed = Number(pegResult.splice(indexRemove, 1));
        feedback.push(removed);
        var backgroundColor = "mediumblue";

        switch(removed) {
            case 1: backgroundColor = "white"; break;
            case 2: backgroundColor = "red"; break;
        }
        
        document.getElementById("f" + rowNumber + "-" + r).style.backgroundColor = backgroundColor;
    }
    
        //if win
    if(String(feedback) === "2,2,2,2") {
        youWin();
        return;
    }
    
    if(rowNumber === 10) {
        youLose();
        return;
    }
    
        //change variables
    rowNumber++;
    currentRow = [0,0,0,0];
    
        //shift indicator
    var nextRowSlot = document.getElementById("row" + rowNumber + "Indicator");
    nextRowSlot.appendChild(document.getElementById("indicator"));
}

function youWin() {
    rowNumber = undefined;
    doNotCheck = true;
    document.getElementById("solutionCode").style.display = "table";
}

function youLose() {
    rowNumber = undefined;
    doNotCheck = true;
    document.getElementById("youLost").style.display = "block";
}

function drawIndicator(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    
    ctx.fillStyle = "cornflowerblue";
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(10,1);
    ctx.lineTo(1,10);
    ctx.lineTo(10,19);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
}