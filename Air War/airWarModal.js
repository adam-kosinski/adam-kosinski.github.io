function addClickListeners() {
        //add listeners for if click on a bullet slot (in the 2 bullet chooser modals, one for each color)
    document.getElementById("lvl1Bullets-1").addEventListener("click",function(){selectBullet(1)});
    document.getElementById("lvl2Bullets-1").addEventListener("click",function(){selectBullet(2)});
    document.getElementById("lvl3Bullets-1").addEventListener("click",function(){selectBullet(3)});
    document.getElementById("lvl4Bullets-1").addEventListener("click",function(){selectBullet(4)});
    document.getElementById("lvl5Bullets-1").addEventListener("click",function(){selectBullet(5)});
    document.getElementById("fireBullet-1").addEventListener("click",fireBullet);
    document.getElementById("cancelBullet-1").addEventListener("click",closeBulletModal);
    
    document.getElementById("lvl1Bullets-2").addEventListener("click",function(){selectBullet(1)});
    document.getElementById("lvl2Bullets-2").addEventListener("click",function(){selectBullet(2)});
    document.getElementById("lvl3Bullets-2").addEventListener("click",function(){selectBullet(3)});
    document.getElementById("lvl4Bullets-2").addEventListener("click",function(){selectBullet(4)});
    document.getElementById("lvl5Bullets-2").addEventListener("click",function(){selectBullet(5)});
    document.getElementById("fireBullet-2").addEventListener("click",fireBullet);
    document.getElementById("cancelBullet-2").addEventListener("click",closeBulletModal);
}


//<<<<<<<<< OPEN/CLOSE MODAL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function openBulletModal() {
    $("#bulletModal-"+p.pNumber).show("fade",600);
}

function closeBulletModal() {
    selectBullet("none"); //to clear styling
    $("#bulletModal-"+p.pNumber).hide("fade",400);
}

//<<<<<<<<< ADD/REMOVE BULLET CHOICES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function addBulletChoice(type) {
    var choiceCell = document.getElementById("lvl" + type + "Bullets-" + p.pNumber);
    var numAlreadyAvailable = p.inventory.bullets[type - 1];
    console.log("numAlreadyAvailable: "+numAlreadyAvailable);
    
        //if no bullets of that type, draw a bullet and set class to available
    if(numAlreadyAvailable === 0) {
        var canvasId = "lvl" + type + "BulletCanvas-" + p.pNumber;
        drawBullet(canvasId,p.color,type,"up");
        
        choiceCell.className = "bulletSlot bulletSlotAvailable";
    }
    
        //update the count that's displayed
    choiceCell.lastElementChild.textContent = "x" + (numAlreadyAvailable + 1);
    
}

function removeBulletChoice(type) {
    var choiceCell = document.getElementById("lvl" + type + "Bullets-" + p.pNumber);
    var numAlreadyAvailable = p.inventory.bullets[type - 1];
    
    if(numAlreadyAvailable === 0) {return}
    if(numAlreadyAvailable === 1) { //if removing the last one, remove image and get rid of available class
        clearCanvas("lvl" + type + "BulletCanvas-" + p.pNumber);
        choiceCell.className = "bulletSlot";
    }
    
        //update the count that's displayed
    choiceCell.lastElementChild.textContent = "x" + (numAlreadyAvailable - 1);
}

//<<<<<<<<< THE HELPFUL BULLET INFORMATION DISPLAYER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function updateBulletInfo(type) { //this gets triggered by the piggybacking we were doing on the mousemove handler in the shops file
    var damageInfo = document.getElementById("damageInfo-" + p.pNumber);
    var speedInfo = document.getElementById("speedInfo-" + p.pNumber);
    
    if(type === "none") { //if not on a choice, empty display
        damageInfo.textContent = "";
        speedInfo.textContent = "";
        return;
    }
    
        //get references
    var choiceCell = document.getElementById("lvl" + type + "Bullets-" + p.pNumber);
    var numAlreadyAvailable = Number(choiceCell.lastElementChild.textContent[1]);
    
    if(numAlreadyAvailable === 0) { //if nothing there, empty display
        damageInfo.textContent = "";
        speedInfo.textContent = "";
        return;
    }
    
        //otherwise, figure out damage and speed
    var damage = gameInfo.bullet.damage[type - 1];
    var speed = gameInfo.bullet.speed[type - 1];
    
    
        //display damage and speed
    damageInfo.textContent = damage + " damage";
    speedInfo.textContent = speed + " units per turn";
}

//<<<<<<<<< SELECTING WHICH BULLET TO FIRE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var bulletSelected;
var canFire = false;

function selectBullet(type) {
	/*function will:	1. Remove 'selected bullet' extra styling and remove firing capability
						2. Check if there's a bullet to fire,
							if so, apply 'selected bullet' extra styling and reinstate firing capability
							if not, end function instead*/
    
    for(var i=1; i<=5; i++) { //remove special styling from bullet choice slots
        var slot = document.getElementById("lvl" + i + "Bullets-" + p.pNumber);
        slot.style.backgroundColor = "white";
    }
	
		//inactivate firing capability
    canFire = false;
    var fireButton = document.getElementById("fireBullet-" + p.pNumber);
    fireButton.style.opacity = 0.5;
    fireButton.style.cursor = "default";
    
    if(type === "none") {return} //to allow clearing of extra style without adding a new one
    
        //check if this slot has a bullet in it (to avoid firing a bullet not in the inventory); also define choiceCell for later styling
    var choiceCell = document.getElementById("lvl" + type + "Bullets-" + p.pNumber);
    var numAlreadyAvailable = Number(choiceCell.lastElementChild.textContent[1]);
    if(numAlreadyAvailable === 0) {return}
    
    
    choiceCell.style.backgroundColor = "#fc3";
    
    bulletSelected = type;
    
    canFire = true;
    fireButton.style.opacity = 1;
    fireButton.style.cursor = "pointer";
}

//<<<<<<<<< FIRING THE BULLET >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function fireBullet() {
    if(!canFire) {return}
    
    removeBulletChoice(bulletSelected); //remove from modal
    
        //remove from inventory
    p.inventory.bullets[bulletSelected - 1] -= 1;
    
    
    
    closeBulletModal(); //clears styling when closing as well; and also changes 'canFire' to false
    
    
    
        /*---------------------Launch Bullet----------------------------------------------------*/
    
        //move from inventory display to field, start moving the bullet
    var inventoryContents = document.getElementById("p"+p.pNumber+"Inventory").childNodes; //returns all nodes, not only elements, but more compatible with browsers
    var foundABulletToLaunch = false; //explained in if statement after for loop
    for(var i = 0; i < inventoryContents.length; i++) {
        var itemId = inventoryContents[i].id;
        if(itemId[1] === "B" && itemId[4] === String(bulletSelected)) { //first will be true if it's a bullet, second if correct bullet
            
            foundABulletToLaunch = true;
            
                //get references
            var bulletToFire = document.getElementById(itemId);
            var launchCell = document.getElementById(bulletLaunchSource[0] + "a" + bulletLaunchSource[1]);
            
                //Create bullet object for battlefield array
            var newBulDamage = gameInfo.bullet.damage[bulletSelected-1];
			var newBulSpeed = gameInfo.bullet.speed[bulletSelected-1];
            
            shinyNewBullet = new Bullet(p.color,newBulDamage,launchDirection,newBulSpeed,itemId);
            
            
                //change styling
            bulletToFire.style.marginRight = "";
            bulletToFire.style.display = "block";
            bulletToFire.className = "bullet";
            
                //redraw the bullet
            clearCanvas(itemId);
            drawBullet(itemId,p.color,bulletSelected,launchDirection);
            
                //move bullet to cell
            launchCell.appendChild(bulletToFire);
            
                //push bullet forward one
            pushBullet(bulletLaunchSource[0], bulletLaunchSource[1], bulletLaunchSource[0], bulletLaunchSource[1], shinyNewBullet);
            
            break;
        }
    }
    
    if(foundABulletToLaunch === false) {
        /*this is soley to inform me when fiddling with the console so that I don't get confuzzled.*/
        throw(new Error("No bullet to launch in inventory display."));
    }
}