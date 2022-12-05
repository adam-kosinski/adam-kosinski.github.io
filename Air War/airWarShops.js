//<<<<<<<<< BUYING AIRCRAFTS, BULLETS, AND ITEMS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var aircraftName = 1;
var bulletName = 1;
/*names are used to give each entity a unique id*/


function buyAircraft(type) {
    
        //determine life
    var life = gameInfo.aircraft.life[type - 1];
    
        //create aircraft container
    var aircraftContainer = document.createElement("div");
    aircraftContainer.id = p.color[0] + "Air" + type + "-" + aircraftName;
    aircraftContainer.className = "aircraft aircraftContainer-" + type;
    aircraftContainer.style.zIndex = 5;
    //aircraftContainer.style.cursor = "-webkit-grab";
    
        //create aircraft
    var aircraft = document.createElement("canvas");
    aircraft.id = p.color[0] + "Air" + type + "-" + aircraftName + "-canvas";
        //append aircraft to container
    aircraftContainer.appendChild(aircraft);
    
    
        //create aircraft health
    health = document.createElement("p");
    health.className = "aircraftHealth";
    health.innerHTML = life;
    
        //append health to container
    aircraftContainer.appendChild(health);
    
        //append container to aircraft bay
    document.getElementById("aircraftBay").appendChild(aircraftContainer);
    
        //draw aircraft
    drawAircraft(aircraft.id,p.color,type); //have to wait until here to draw it b/c can't access the canvas via document.getElementById() if the canvas isn't in the document yet
    setDraggable(aircraftContainer.id);
    
        //Increment aircraftName
    aircraftName++;
    
    moveElement = aircraftContainer;
}



function buyBullet(type) {
    
        //create bullet
    var bullet = document.createElement("canvas");
    bullet.id = p.color[0] + "Bul" + type + "-" + bulletName;
    bulletName++;
    
        //add styling for display in inventory !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MAKE THIS BETTER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    bullet.style.display = "inline-block";//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    bullet.style.marginRight = "5px";
    
    
    /*NOTE: The bullet, when launched, will be redrawn in the correct orientation, on the same canvas (which will be moved
	from the inventory to the battlefield and restyled in the process)*/
	
		//subtract money from player
	updatePlayerData("money",-1* bulletCosts[type - 1],p);
    
        //append bullet to inventory display
    document.getElementById("p"+p.pNumber+"Inventory").appendChild(bullet);
        
        //add bullet choice in modal
    addBulletChoice(type);
    
	    //add bullet to player inventory object - must do this after calling addBulletChoice(), otherwise, will mess up w/ numAlreadyAvailable
	p.inventory.bullets[type - 1]++;
	
        //draw bullet
    drawBullet(bullet.id,p.color,type,"up");
    
    figureOutBuyables();
	
	useMove();
}

//<<<<<<<<< MUST DEPLOY AIRCRAFT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var moveElement;
document.onmousemove = mouseMove;

function mouseMove(e) {
        //Since there's a mousemove handler here, also use it for the modal:
    var target = e.target;
    if(target.parentElement) {
        var targetId = target.id;
        var parentId = target.parentElement.id;
        
        var type;
        if($("#"+targetId).hasClass("bulletSlot")) { //if hover directly over the container
            type = Number(targetId[3]); //4th character in id, which is structured "lvl_Bul..."
            updateBulletInfo(type);
        }
        else if($("#"+parentId).hasClass("bulletSlot")) { //if hover directly over a child
            type = Number(parentId[3]); //4th character in id, which is structured "lvl_Bul..."
            updateBulletInfo(type);
        } else {
            updateBulletInfo("none");
        }
    }
    
    //Back to what this was intended for------------------------------
    
    if(!moveElement) {return}
    
	//get DOMRect objects - have properties: top,left,bottom,right,x,y,width,height
	var elRect = moveElement.getBoundingClientRect();
	var aircraftBayRect = document.getElementById("aircraftBay").getBoundingClientRect(); //default top and left client coords of aircraft
    
	//will be basing stuff off of client coords
	var xCoord = e.clientX - aircraftBayRect.left - (elRect.width/2);
	var yCoord = e.clientY - aircraftBayRect.top - (elRect.height/2);
	
    moveElement.style.left = xCoord + "px";
    moveElement.style.top = yCoord + "px";
}

//<<<<<<<<< TRASH >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function makeTrashWork() {
    $("#trash").droppable({
        accept: function(draggable) {
            var draggy = document.getElementById(draggable.attr("id"));
            
            if(draggy.parentElement === document.getElementById("aircraftBay")) {return true}
            if(draggy.parentElement === document.getElementById("")) {return true} // for inventory stuff, don't forget !!!!!!!!!!!!!!!!!
        },
        drop: function(event, ui) {
            var draggy = ui.draggable[0];
            $("#"+draggy.id).hide("scale",750);
            moveElement = undefined;
        }
    });
}