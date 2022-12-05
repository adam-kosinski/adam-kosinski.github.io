
//<<<<<<<<< MOVING ICON AROUND >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var iconShowing = false;

function iconToCell(r,c) {
        //draw icon
    var directions = []; //this inputs a one or zero depending on what the boolean evaluates to
    directions.push(r > 1);
    directions.push(c < 7);
    directions.push(r < 9);
    directions.push(c > 1);
    
    drawIcon("icon", directions);
    //activateIconCanvas(); //defined under 'determining direction' section !!!!!!!!!!!!! is this necessary (when redraw icon)? - run an experiment!!!!!
    
        //get references
    var icon = document.getElementById("directionIcon");
    var cell = document.getElementById(r + "a" + c);
    var aircraftId = cell.lastElementChild.id;
    
        //add to cell, manage styles
    cell.insertBefore(icon, cell.firstChild);
    icon.style.marginTop = ((icon.parentElement.lastElementChild.offsetHeight - 50) / 2)+"px";
    
        //show icon
    $("#"+aircraftId).fadeTo(250,0);
    $("#directionIcon").show("scale",{easing:"easeOutElastic"},750, function(){iconShowing = true});
}

function removeIcon() {
    var icon = document.getElementById("directionIcon");
    var cell = icon.parentElement;
    var aircraftId = cell.lastElementChild.id;
    
    var storage = document.getElementById("directionIconStorage");
    
    $("#"+aircraftId).fadeTo(250,1);
    $("#directionIcon").hide("scale", 250, function(){
        storage.appendChild(icon);
        iconShowing = false;
    });
}

//<<<<<<<<< DETERMINING DIRECTION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var launchDirection;
function activateIconCanvas() {
    var canvas = document.getElementById("icon");
    var ctx = canvas.getContext("2d");
    canvas.addEventListener("mousemove",function(e) {
        getColor(e,ctx,"icon");
    });
}

function getColor(e,ctx,canvasId) { //sets launch direction and cursor type when hovering (used for direction icon)
    var x = e.layerX;
    var y = e.layerY;
    var pixel = ctx.getImageData(x,y,1,1);
    var colorArray = pixel.data;
    
        //get rgb
    var rgb = "rgb("+ colorArray[0] + "," + colorArray[1] + "," + colorArray[2] + ")";
    
        //get direction and pointer
    switch(rgb) {
        case "rgb(255,0,1)": launchDirection = "up"; break;
        case "rgb(255,0,2)": launchDirection = "down"; break;
        case "rgb(255,1,0)": launchDirection = "left"; break;
        case "rgb(255,2,0)": launchDirection = "right"; break;
        default: launchDirection = undefined;
    }
    
    var canvas = document.getElementById(canvasId);
    if(launchDirection === undefined) {
        canvas.style.cursor = "default";
    } else {
        canvas.style.cursor = "pointer";
    }
}

//<<<<<<<<< DRAW ICON FUNCTION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function drawIcon(canvasId,directions) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth = 2;
    
        //clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
        //up arrow
    if(directions[0]) {
        ctx.beginPath();
        ctx.moveTo(25,1);
        ctx.lineTo(18,13);
        ctx.lineTo(22,13);
        ctx.lineTo(22,25);
        ctx.lineTo(28,25);
        ctx.lineTo(28,13);
        ctx.lineTo(32,13);
        ctx.closePath();
        
        ctx.fillStyle = "rgb(255,0,1)";
        ctx.fill();
        ctx.stroke();
    }
        //down arrow
    if(directions[2]) {
        ctx.beginPath();
        ctx.moveTo(25,49);
        ctx.lineTo(18,37);
        ctx.lineTo(22,37);
        ctx.lineTo(22,25);
        ctx.lineTo(28,25);
        ctx.lineTo(28,37);
        ctx.lineTo(32,37);
        ctx.closePath();
        
        ctx.fillStyle = "rgb(255,0,2)";
        ctx.fill();
        ctx.stroke();
    }
        //left arrow
    if(directions[3]) {
        ctx.beginPath();
        ctx.moveTo(1,25);
        ctx.lineTo(13,18);
        ctx.lineTo(13,22);
        ctx.lineTo(25,22);
        ctx.lineTo(25,28);
        ctx.lineTo(13,28);
        ctx.lineTo(13,32);
        ctx.closePath();
        
        ctx.fillStyle = "rgb(255,1,0)";
        ctx.fill();
        ctx.stroke();
    }
        //right arrow
    if(directions[1]) {
        ctx.beginPath();
        ctx.moveTo(49,25);
        ctx.lineTo(37,18);
        ctx.lineTo(37,22);
        ctx.lineTo(25,22);
        ctx.lineTo(25,28);
        ctx.lineTo(37,28);
        ctx.lineTo(37,32);
        ctx.closePath();
        
        ctx.fillStyle = "rgb(255,2,0)";
        ctx.fill();
        ctx.stroke();
    }
        //circle
    ctx.beginPath();
    ctx.arc(25,25,7,0,2*Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#ff9900";
    ctx.fill();
    ctx.stroke();
}