    //Variables
var color = "rgb(0,0,0)"; //changed with 'c'
var radius = 10; //changed with 'w'
var erasing = false; //toggled with 'e'

var circleFeatureOn = true; //toggled with 'o'

var colorPickerShowing = false;
var infoShowing = false; //toggled with 'i'

/*--------------------------- preparation/setup stuff ----------------------------------*/

var body = document.getElementsByTagName("body")[0];
var canvas = document.getElementById("drawCanvas");
var ctx = canvas.getContext("2d");

    //set width and height
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

    //set canvas background to white, so it shows up like that on download
ctx.fillStyle = "white";
ctx.fillRect(0,0,canvas.width,canvas.height);


//these are triggered on the body so that the erase circle can remain above the drawCanvas but drawing can still happen
body.addEventListener("mousedown",startDraw);
body.addEventListener("mouseup",stopDraw);
body.addEventListener("keypress",keypressHandler);


    //mouse coordinate variables
var mouseX;
var mouseY;

var previousX;
var previousY;

// set up outlineCircle -------------------
    //references
var outlineCircle = document.getElementById("outlineCircle");
var eCtx = outlineCircle.getContext("2d"); //eCtx name came from when outlineCircle was eraseCircle, I don't feel like renaming it

    //set up mouse tracking
body.addEventListener("mousemove",function(e){
    outlineCircle.style.top = e.pageY - (outlineCircle.width/2) + "px";
    outlineCircle.style.left = e.pageX - (outlineCircle.height/2) + "px";
});

    //define drawing function
function drawOutlineCircle() {
    //resize canvas
    outlineCircle.width = radius * 2;
    outlineCircle.height = radius * 2;
    
    //clear canvas
    eCtx.clearRect(0,0,outlineCircle.width,outlineCircle.height);
    
    
    //draw circle
    eCtx.arc(outlineCircle.width/2, outlineCircle.height/2, radius, 0, 2*Math.PI);
    eCtx.lineWidth = 1;
        //if erasing, make it red, if drawing, make it black
    eCtx.strokeStyle = erasing ? "red" : "black";
    eCtx.stroke();
}

    //draw initial erase circle
drawOutlineCircle();

/*-------------------------------------------------------------*/

//FUNCTIONS!!!!!!!!!!!!!


function startDraw(e) {
    //if anything is 'showing', don't draw
    if(colorPickerShowing || infoShowing) {return}
    
    body.addEventListener("mousemove",draw);
    mouseX = e.pageX;
    mouseY = e.pageY;
    
    draw(e); //so if click, get a circle right there
}
function stopDraw() {
    body.removeEventListener("mousemove",draw);
}


function draw(e) {
    
        //get previous mouse coords
    previousX = mouseX;
    previousY = mouseY;
    
        //get new mouse coords
    mouseX = e.pageX;
    mouseY = e.pageY;
    
    
    //if 'erasing' is true, make the fillStyle and strokeStyle white, otherwise set it to 'color'
    ctx.fillStyle = erasing ? "white" : color;
    ctx.strokeStyle = erasing ? "white" : color;
    
    //draw endpoint circles
    ctx.beginPath();
    ctx.arc(previousX, previousY, radius, 0, 2*Math.PI); //start endpoint
    ctx.arc(mouseX, mouseY, radius, 0, 2*Math.PI); //end endpoint
    ctx.closePath();
    
    ctx.fill();
    
    //draw line segment
    ctx.beginPath();
    ctx.moveTo(previousX,previousY);
    ctx.lineTo(mouseX,mouseY);
    ctx.closePath();
    
    ctx.lineWidth = radius * 2;
    ctx.stroke();
}






// keypress can trigger downloading, freeze drawing to image, line width change, erasing change, outlineCircle change, color pick
function keypressHandler(e) {
    
    // NOTE: keyCodes are just ASCII codes
    console.log(e.keyCode)
    
    // check if 'd' was pressed -- download
    if(e.keyCode === 100) {
        
        // ask if should download
        if(confirm("Download drawing?")) {
            
            // ask user what to call the file
            var filename = prompt("File Name:","drawing.png");
            
            //if the user hit 'cancel', don't continue -- if filename has a value, continue with download
            if(filename) {
                
                // create a png image and go to that url, user can download/save from there
                var dt = canvas.toDataURL('image/png');
                
                //replace first part so that it will download
                dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
                
                //define HTTP headers - stack overflow said it was a good idea
                dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=drawing.png');
                
                
                //create an <a> element so that I can specify the download attribute and the download will get a name
                var link = document.createElement("a"); //create <a> element, will delete this later
                body.appendChild(link); //necessary in some browsers
                link.download = filename; //set download attribute
                link.href = dt; //set href attribute
                link.click(); //download
                body.removeChild(link); //remove <a> element
            }
        }
    }
    
    //check if 'space' was pressed -- for image freeze (useful b/c can drag the image to a project without having to download)
    if(e.keyCode === 32) {
        // get image URI
        var URI = canvas.toDataURL("image/png");
        
        // in order to open in a new tab instead of changing the current tab (which would cause the draw canvas to be erased),
        // it needs to open on a click event.  Therefore, create an <a> and simulate a click
        
        var a = document.createElement("a"); //create <a> element
        body.appendChild(a); //might be useful, since it supposedly was when downloading
        a.href = URI; //set href of <a> element
        a.target = "_blank"; //make the link open a new tab
        a.click(); //simulate a click
        body.removeChild(a); //delete the <a> element
        
    }
    
    // check if 'w' was pressed -- for line width change
    if(e.keyCode === 119) {
        
        // get new width and convert to number
        var newWidth = prompt("New line width in pixels:") * 1;
        
        // check if newWidth is a valid value
        if(typeof newWidth === "number" && newWidth > 0) {
            // update radius
            radius = newWidth / 2;
        }
        
        //change outlineCircle size
        drawOutlineCircle();
    }
    
    // check if 'e' was pressed -- toggling eraser
    if(e.keyCode === 101) {
        
        //toggle 'erasing' variable
        erasing = erasing ? false : true;
        
        //redraw outlineCircle based on new state of 'erasing'
        drawOutlineCircle();
    }
    
    // check if 'o' was pressed -- toggling outlineCircle
    if(e.keyCode === 111) {
        //toggle outlineCircle display - if not displaying, change display to block, else change display to none
        outlineCircle.style.display = (getComputedStyle(outlineCircle).display === "none") ? "block" : "none";
    }
    
    // check if 'c' was pressed -- open/close color palette (can also close w/ OK button)
    if(e.keyCode === 99) {
        
        // if showing, hide it and change 'colorPickerShowing'
        if(colorPickerShowing) {
            document.getElementById("palette").style.display = "none";
            colorPickerShowing = false;
            
        } else if(!colorPickerShowing) { //if not showing, change 'colorPickerShowing' and show it
            //notify program that we're picking a color
            colorPickerShowing = true;
            
            //show color picker
            document.getElementById("palette").style.display = "block";
        }
    }
    
}
















// COLOR PALETTE FUNCTION
(function(){
    var cellArray = [];
    
    
    function initializeColorPalette() {
        var h;
        var s;
        var l;
        
        //get palette reference
        var palette = document.getElementById("palette");
        
        //create table
        var table = document.createElement("table");
        
        //create tbody
        var tbody = document.createElement("tbody");
        
        
        //create 9 rows
        for(var r = 0; r <= 10; r++) {
            
            //set lightness
            l = r * 10; // r=0 is black row, r=10 is white row
            
            //create row
            var row = document.createElement("tr");
            
            //create 13 cols
            for(var c = 0; c < 13; c++) {
                
                //create cell
                var cell = document.createElement("td");
                
                //check if black or white row, if so, set background color, append cell, and break out of 'column' loop
                if(r === 0) {
                    cell.style.backgroundColor = "rgb(0,0,0)";
                    cell.className = "pickedColor"; //set black as default picked cell
                    cellArray.push(cell);
                    row.appendChild(cell);
                    break;
                }
                if(r === 10) {
                    cell.style.backgroundColor = "rgb(255,255,255)";
                    cellArray.push(cell);
                    row.appendChild(cell);
                    break;
                }
                
                // make first col neutral
                if(c === 0) {
                    h = 0; //hue doesn't matter
                    s = 0; //make neutral
                } else {
                    h = (c - 1) * 30; //for first color column h=0*30, for last color column h=11*30
                    s = 100;
                }
                
                // set background color
                cell.style.backgroundColor = "hsl(" + h + "," + s + "%," + l + "%)"; //s and l need percent sign, since they're percents
                
                //add cell to cellArray
                cellArray.push(cell);
                
                //append cell to row
                row.appendChild(cell);
            }
            
            //append row to tbody
            tbody.appendChild(row);
            
        }
        
        //put tbody in table
        table.appendChild(tbody);
        
        //put table in palette
        palette.appendChild(table);
        
        //put the submit button after it
        var submitButton = document.createElement("button");
        submitButton.textContent = "OK";
        submitButton.id = "submitColor";
        palette.appendChild(submitButton);
        
        
        //set up mouse hover event -------------
        // get colorDisplay reference
        var colorDisplay = document.getElementById("colorDisplay");
        
        //set initial colorDisplay color
        colorDisplay.style.backgroundColor = "black";
        
        //add event listener for hover
        palette.addEventListener("mousemove",function(e){
            //if the user didn't hover over a <td>, stop function
            if(e.target.tagName !== "TD") {return}
            
            //set background color of color display to background color of event target
            colorDisplay.style.backgroundColor = e.target.style.backgroundColor;
        });
        
        
        
        //set up mouse click event ----------
        palette.addEventListener("click",function(e){
            //get the event target
            var target = e.target;
            
            //make sure the target was a <td> -- stop function if not
            if(target.tagName !== "TD") {return}
            
            //change current selected color visual
            //first revert all to normal
            for(var i = 0; i < cellArray.length; i++) {
                //reset styling by removing class
                cellArray[i].className = "";
            }
            //change event target's styling to special
            target.className = "pickedColor";
            
            //change color variable
            color = target.style.backgroundColor;
        });
        
        //set up button click -- clear palette if clicked
        submitButton.addEventListener("click",function(){
            palette.style.display = "none";
            colorPickerShowing = false;
        });
    }
    
    initializeColorPalette();
})();