var animationPending = false;

//<<<<<<<<< FREEZE USER INTERACTION FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
/*(used so that the user can't do anything while bullets are being moved)*/

function disableClicks() {
    document.getElementById("clickDisabler").style.display = "block";
}
function enableClicks() {
    document.getElementById("clickDisabler").style.display = "none";
}

//<<<<<<<<< BULLET MOVEMENT ANIMATION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function animateBullet(bulId,direction,distance) {
    
        //get reference
    var movingBullet = document.getElementById(bulId);
    
        //figure out directions
    var dArray = [0,0]; //stands for 'direction array'; these are top and left
    
    
    switch(direction) { //NOTE: cells are 70px * 80px, but don't forget the dots, which are 12x12
        case "up": dArray[0] = -80; break;
        case "right": dArray[1] = 82; break;
        case "down": dArray[0] = 80; break;
        case "left": dArray[1] = -82; break;
    }
    
    dArray[0] *= distance;
    dArray[1] *= distance;
    
        //add the '+='
    dArray[0] = "+=" + dArray[0];
    dArray[1] = "+=" + dArray[1];
    
    
    
        //animate it
    animationPending = true;
    
    $("#"+bulId).animate({
        marginTop: dArray[0],
        marginLeft: dArray[1]
    },{
        duration: 800,
        complete: function() {animationPending = false}
    });
}