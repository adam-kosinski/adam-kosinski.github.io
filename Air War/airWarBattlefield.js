function Ref(row,col) {
    if(row === "row") {return battlefield[col - 1]} //so that Ref("row",4) can be used to see row 4
    else {return battlefield[row - 1][col - 1]} //normal behavior
}

//<<<<<<<<< DEFINE TYPES OF ENTITIES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function Base(color) {
    this.type = "base";
    this.color = color;
    this.life = 100;
    this.id = color+"Base";
}
function Aircraft(color,level,id) {
    this.type = "aircraft";
    this.color = color;
    this.life = gameInfo.aircraft.life[level - 1];
    this.forcefield = false;
    this.level = level;
    
    this.id = id; //automation for this doesn't work b/c aircraftName is different when create battlefield object as when create HTML aircraft
}
function Bullet(color,damage,direction,speed,id) {
    this.type = "bullet";
    this.id = id;
    this.color = color;
    this.damage = damage;
    this.direction = direction;
    this.speed = speed;
}
function Money() {
    this.type = "money";
    this.level = 1;
    this.amount = 10;
}

//<<<<<<<<< VARIABLES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

var battlefield = [
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    ];

//<<<<<<<<< ENTER BASES INTO BATTLEFIELD >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var greenBase = new Base("green");
var blueBase = new Base("blue");
battlefield[8][3] = greenBase;
battlefield[0][3] = blueBase;

//<<<<<<<<< DRAG AND DROP >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function locateValidCells() {
    for(var tableRow = 1; tableRow <= 9; tableRow++) {
        for(var tableCol = 1; tableCol <= 7; tableCol++) {
            setDroppable(tableRow+"a"+tableCol,tableRow,tableCol);
        }
    }
}

function setDroppable(cellId,cellRow,cellCol) {
    
    var getSourceCoords = function(draggy) { //source coords are coords from which aircraft used to be
        var sourceIdArray;
        
        if(draggy.parentElement === document.getElementById("aircraftBay")) { //if it's an aircraft ready to be launched
        
            sourceIdArray = document.getElementById(p.color+"Base").parentElement.id.split("a");
            
        } else { //otherwise, figure out where it is and proceed normally
            sourceIdArray = draggy.parentElement.id.split("a");
        }
        
        return sourceIdArray;
    };
    
    $("#"+cellId).droppable({
        accept: function(draggable) {
                var draggy = document.getElementById(draggable.attr("id"));
                var elClass = draggy.classList[0]; //first class of a drag element should be type of entity (b/c I set the class like so)
                
                if(draggy.parentElement === document.getElementById("aircraftBay")) { //if it's an aircraft for launching, indicate so
                    elClass = "launchAircraft";
                }
                
                    //figure out source coords
                var sourceIdArray = getSourceCoords(draggy);
                var sourceRow = Number(sourceIdArray[0]);
                var sourceCol = Number(sourceIdArray[1]);
                
                
                    //DO CHECKS FOR IF DESTINATION COORDS ARE LEGAL
                    
                if(cellCol >= sourceCol - 1 && cellCol <= sourceCol + 1) { //checks if sideways only 1
                    
                    if(elClass === "base" && cellRow == sourceRow) { //if a base and if on same row
                        return true;
                    }
                    if(elClass === "launchAircraft") {
                        if(cellCol === sourceCol && cellRow === sourceRow) {return false} //so it doesn't land on the base
                        if(cellRow >= sourceRow - 1 && cellRow <= sourceRow + 1) { //checks if vertically only 1
                            if(cellCol >= sourceCol - 1 && cellCol <= sourceCol + 1) { //checks if sideways only 1
                                return true;
                            }
                        }
                    }
                    if(elClass === "aircraft") { //if an aircraft
                        if(cellRow >= sourceRow - 1 && cellRow <= sourceRow + 1) { //checks if vertically only 1
                            if(cellCol === sourceCol) {return true} //so it can't go diagonally
                            if(cellRow === sourceRow) {return true}
                        }
                    }
                }
                
                return false; //if no check statements are satisfied, return false
        },
        drop: function(event, ui) {
            var dragEntity = ui.draggable[0];
            
            if(dragEntity.parentElement !== document.getElementById("aircraftBay")) {dragEntity.style.zIndex = 2}
            //the check is so that an invalid drag-drop launch won't change the z-index
            
                //figure out source coords; have to do it somewhere before the animation
            var sourceIdArray = getSourceCoords(dragEntity);
            var sourceRow = Number(sourceIdArray[0]);
            var sourceCol = Number(sourceIdArray[1]);
            
            var whatToDo = checkEntity("base",cellRow - 1,cellCol - 1); //checkEntity for base is the same as checkEntity for aircraft
            console.log("air-whatToDo: "+whatToDo)
            switch(whatToDo) {
                case "goAhead": break;
                case "blocked": return; //do nothing; checkEntity also returns this if you just put the aircraft back where it started
                case "damage": break;
                case "pushBullet": pushBullet(cellRow,cellCol,cellRow,cellCol); break;
                case "addMoneyToPlayer":
                    var refCell = battlefield[cellRow - 1][cellCol - 1];
                    updatePlayerData("money",refCell.amount,p); //'p' passes current player as 3rd argument
                    document.getElementById(cellRow+"a"+cellCol).innerHTML = "";
                break;
            }
            
                /* need to append the aircraft before any animations take place */
            
                //However, there is a check farther down that's based upon dragEntity's parent element; have to do that check here
            var areLaunching;
            if(dragEntity.parentNode === document.getElementById("aircraftBay")) {areLaunching = true}
            else {areLaunching = false}
            
            document.getElementById(cellId).appendChild(dragEntity); // can just do this now, solves graphics problems (conflict w/ bullet animation)
            moveElement = undefined; //wouldn't reach this point if checkEntity returned "blocked"; if successful launch, need to do this
										//(if not launching, no big deal, moveElement is already undefined
            
                /* wait for bullet animation to finish - setDroppableContinue will check every 50ms and continue if pushBulletFinished === true */
            
          var setDroppableContinue = function() { //this is called down after this curly bracket closes
            if(!pushBulletFinished) {
                    //if pushBullet didn't finish, schedule another check then stop doing stuff
                window.setTimeout(setDroppableContinue,50);
                return;
            }
            console.log("no push bullet animation pending; continued with dropping function")
            
			
			
                /*------------------update battlefield array--------------------------------------------*/
                
            dragEntity.style.top = 0;
            dragEntity.style.left = 0;
            /*as an extra precaution in case things get weird from odd mouse input w/ the drag-drop ui
            (they shouldn't in the real game but did during testing some cases)*/
            
            if(areLaunching) { //if launching an aircraft, enter aircraft into battlefield
                    //figure out aircraft stats
                var aircraftInfo = dragEntity.id.split("-")[0];
                var aircraftStats = aircraftInfo.split("Air");
                
                var airColor;
                switch(aircraftStats[0]) {
                    case "g": airColor = "green"; break;
                    case "b": airColor = "blue"; break;
                }
                
				var airLevel = Number(aircraftStats[1]);
				                
					//create new aircraft object (for battlefield array)
				var shinyNewAircraft = new Aircraft(airColor,airLevel,dragEntity.id);
                var l = shinyNewAircraft.level;
                
                    //remove money
				updatePlayerData("money",-1 * aircraftCosts[l - 1],p);
				
					//calculate moves added
				p.moves += gameInfo.aircraft.movesAdded[l - 1];
                
                figureOutBuyables();
                
                    //add to battlefield array
                battlefield[cellRow - 1][cellCol - 1] = shinyNewAircraft;
                
            } else { //if not launching
                //console.log("sourceRow: "+sourceRow,"sourceCol: "+sourceCol)
                battlefield[cellRow - 1][cellCol - 1] = battlefield[sourceRow - 1][sourceCol - 1];
                battlefield[sourceRow - 1][sourceCol - 1] = 0;
            }
            
                /*----------------------------------------------------------------------------------------*/
            
            dragEntity.style.zIndex = 2; //downgrades z-index if successful deployment (wouldn't reach this point if checkEntity returned 'blocked')
            
            dragEntity.addEventListener("dblclick", startBulletLaunch);
            
            if(cellRow !== sourceRow || cellCol !== sourceCol) {
                useMove();
            }
            console.log("row8:",Ref("row",8))
          }; //end of the setDroppableContinue function
          setDroppableContinue();
        }
    });
}

function setDraggable(id) {
    var dragEntity = document.getElementById(id);
    $("#"+id).draggable({
        disabled: false, //set explicity here so that setDraggable() can be used to undo unsetDraggable()
        start: function(event, ui) {
            dragEntity.style.cursor = "-webkit-grabbing";
            dragEntity.style.zIndex = 5;
        },
        stop: function(event, ui) {
            dragEntity.style.cursor = "-webkit-grab";
            dragEntity.style.top = 0;
            dragEntity.style.left = 0;
        }
    });
}

function unsetDraggable(id) {
    $("#"+id).draggable("option","disabled",true);
}

//<<<<<<<<< ENTITY FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function checkEntity(wantToAdd,row,col) {
    var refCell = battlefield[row][col];
    
    
    if(!refCell.type) {return "goAhead"} //if a '0' there
    
    switch(wantToAdd) {
        case "bullet":
            if((refCell.type === "base" || refCell.type === "aircraft") && refCell.color !== p.color) {return "attack"}
            if((refCell.type === "base" || refCell.type === "aircraft") && refCell.color === p.color) {return "pushBullet"}
            if(refCell.type === "money") {return "pushBullet"}
            if(refCell.type === "bullet") {} //? ? ? ? ? ? ? explode maybe? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 
        break;
        case "money":
            if(refCell.type === "money") {return "increaseValue"}
            if(refCell.type === "base" || refCell.type === "aircraft") {
                if(refCell.color === "green") {return "addMoneyToGreen"}
                if(refCell.color === "blue") {return "addMoneyToBlue"}
            }
            if(refCell.type === "bullet") {return "pushBullet"}
        break; //money can also land on a bullet and push it, don't forget to add that
        case "base":
            if(refCell.type === "money") {return "addMoneyToPlayer"}
            if(refCell.type === "base" || refCell.type === "aircraft") {return "blocked"}
            if(refCell.type === "bullet" && refCell.color !== p.color) {return "damage"}
            if(refCell.type === "bullet" && refCell.color === p.color) {return "pushBullet"}
    }
}

function damageEntity(row,col,damage){ //coords are non-array ones (i.e. 1 through _)
	var refCell = battlefield[row-1][col-1];
	if(!(refCell.type === "aircraft" || refCell.type === "base")){return} //only can damage aircrafts and bases
	
	//get element reference
	var entity = document.getElementById(refCell.id);
	
	//subtract damage
	refCell.life = Math.max(refCell.life-damage, 0); //Math.max ensures lowest possible value is 0
	
	if(refCell.type === "aircraft"){
		if(refCell.life <= 0){ //if aircraft destroyed
			//remove aircraft from battlefield array
			battlefield[row-1][col-1] = 0;
			
			//destroy aircraft visually
			entity.parentElement.removeChild(entity); //////////////////// IMPROVE DESTRUCTION - MAKE ANIMATED !!!!!!!!!!!!!!!!!!/////////////
			
			//award destruction money to opponent
			var moneyToAward = gameInfo.aircraft.destructionAward[refCell.level-1]
			if(refCell.color === "green"){updatePlayerData("money",moneyToAward,p2)}
			if(refCell.color === "blue"){updatePlayerData("money",moneyToAward,p1)}
		} else {
			//update health display (already updated in battlefield array) !!!!!!!!!!!!!! MAKE ANIMATED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
			entity.lastElementChild.textContent = refCell.life; //last child of aircraft container is life display
		}
	}
	if(refCell.type === "base"){
		//update health display, regardless of if destroyed or not
		entity.textContent = refCell.life;
		
		if(refCell.life <= 0){ //if base destroyed
			if(refCell.color === "green"){
				alert("Blue wins!"); ////////////////////// MIGHT WANT TO DO SOMETHING MORE INTERESTING /////////////////////////////////////////
			}
			if(refCell.color === "blue"){
				alert("Green wins!");
			}
		}
	}
}


var pushBulletFinished = true;
function pushBullet(posR,posC,parentR,parentC,launchingObject,speedFulfilled) {
    //parent is the cell containing the bullet in the DOM, 5th argument omitted if not launching a bullet, 6th argument for managing speed, normally omitted
    
    /*NOTE: parent coords won't be the same as position coords if checkEntity returned 'pushBullet'
    e.g. if the bullet landed on money after being pushed one unit
        -we wouldn't want to add the bullet to the cell with the money but rather leave it (non-display) in its starter cell until it found a valid stopping point*/
    
    
    pushBulletFinished = false;
    var exitOut = true; //used to determine whether should execute the exiting statements
    
    disableClicks();
    
        //get DOM references
    var startCell = document.getElementById(parentR+"a"+parentC); //used to destroy the HTML bullet later, also to get the bullet reference if launching
    
    var bullet;
    if(launchingObject) { //if launching, the bullet will be sharing a cell with an aircraft and also not be in the battlefield array
        bullet = startCell.lastElementChild;
        
    } else { //otherwise, get the bullet's id straight from the battlefield memory storage
        var bulletId = battlefield[parentR - 1][parentC - 1].id;
        bullet = document.getElementById(bulletId);
    }
    
    
    
        //determine speed
    var pushSpeed;
    switch(bullet.id[4]) {
        case "1": pushSpeed = 1; break;
        case "2": pushSpeed = 1; break;
        case "3": pushSpeed = 1; break;
        case "4": pushSpeed = 2; break;
        case "5": pushSpeed = 2; break;
    }
    
        //determine direction
    var pushDirection;
    if(launchingObject) {pushDirection = launchDirection}//if launching the bullet, direction set to the string stored in the global variable 'launchDirection'
															//which is defined along with the direction picker icon
    else {
        pushDirection = battlefield[parentR - 1][parentC - 1].direction; //otherwise, reference this bullet in battlefield and get its direction
    }
    
    
        //create an array to store things to add to the coordinates - [addThisAmountToRow, addThisAmountToCol]
    var directionAdder;
    switch(pushDirection) {
        case "up": directionAdder = [-1,0]; break;
        case "right": directionAdder = [0,1]; break;
        case "down": directionAdder = [1,0]; break;
        case "left": directionAdder = [0,-1]; break;
    }
    
        //find new coordinates
    var newPosR = posR + directionAdder[0];
    var newPosC = posC + directionAdder[1];
    
            //animate the bullet
    animateBullet(bullet.id,pushDirection,1);
    
  var pushBulletContinue = function() { //so that the program waits for the bullet animation to finish before executing the rest of this function
    if(animationPending) {
		//if animation still going on, stop doing stuff and check again in 50ms
        window.setTimeout(pushBulletContinue,50);
        return;
    }
    
    
        //figure out if the bullet went off the battlefield
    if(newPosR<1 || newPosR>9 || newPosC<1 || newPosC>7) {
            //if so, destroy bullet object and HTML bullet
        battlefield[parentR - 1][parentC - 1] = 0;
        startCell.removeChild(bullet);
    } else {
        
        
            //figure out what to do now
        var whatToDo = checkEntity("bullet", newPosR - 1, newPosC - 1);
        console.log("pushBullet-WhatToDo: "+whatToDo)
        switch(whatToDo) {
            case "goAhead":
                
                
                    //update the battlefield array
                if(!launchingObject) {
                    battlefield[newPosR - 1][newPosC - 1] = battlefield[parentR - 1][parentC - 1];
                    battlefield[parentR - 1][parentC - 1] = 0;
                } else { //if launchingObject exists (meaning we're launching a bullet), use it
                    battlefield[newPosR - 1][newPosC - 1] = launchingObject;
                }
                
                    //update the display
                var newCell = document.getElementById(newPosR+"a"+newPosC);
                newCell.appendChild(bullet);
                bullet.style.margin = 0;
                bullet.style.margin = "auto";
                
                
                    //check to see if the speed dictates pushing the bullet again
                
                if(pushSpeed === 2 && speedFulfilled === undefined) {
                    pushBullet(newPosR,newPosC,newPosR,newPosC,undefined,true);
                    exitOut = false; //reason for this is explained below
                    break;
                }
                
                break;
            case "attack": ; break;
            case "pushBullet":
                var continueLaunchingObject;
                if(launchingObject) {continueLaunchingObject = launchingObject}
                
                pushBullet(newPosR,newPosC,parentR,parentC,continueLaunchingObject,speedFulfilled);
                //last argument to pass on the current state of speedFulfilled, so that if it WAS fulfilled, it won't get unfulfilled
                exitOut = false;
                /* If pushBullet gets nested a lot, the exiting statements (below) only need to be run once.
                Therefore if I set exitOut to false whenever I call pushBullet from within pushBullet,
                the exit statements will be disabled for every execution of pushBullet except the one
                that doesn't call pushBullet, which is also the only one that will wait for the latest
                animation to finish (because the other ones already started and finished waiting for
                the animation they called. --oh, could also just use "return;" right there*/
                break;
        }
    }
    
        //exiting statements
    if(exitOut) {
        enableClicks();
        pushBulletFinished = true;
    }
  };
  pushBulletContinue();
}

//<<<<<<<<< LAUNCH BULLET FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var bulletLaunchSource;
function startBulletLaunch(e) {
        //figure out which aircraft was double clicked on
    var sourceAircraft;
    if(e.target.tagName === "DIV") { //if clicked on parent div (aircraft container), use that
        sourceAircraft = e.target;
    } else { //if clicked on child of parent div, use parent
        sourceAircraft = e.target.parentNode;
    }
    
        //figure out location of aircraft
    var cellId = sourceAircraft.parentElement.id;
    bulletLaunchSource = cellId.split("a");
    
    bulletLaunchSource[0] = Number(bulletLaunchSource[0]);
    bulletLaunchSource[1] = Number(bulletLaunchSource[1]);
    var r = bulletLaunchSource[0];
    var c = bulletLaunchSource[1];
    
        //call icon to that cell
    iconToCell(r,c);
}

function pickDirection() {
    if(!launchDirection) {return}
    removeIcon();
    console.log("launchDirection: "+launchDirection);
    openBulletModal();
}

function handleClick(e) { //so that clicks that are not on the direction picker icon will clear the icon, event handler bound in HTML file
	var icon = document.getElementById("directionIcon");
    if(!iconShowing) {return}
    
    if(e.target === icon || e.target === icon.firstElementChild) { //if clicked on the icon
        pickDirection();
    } else {removeIcon()}
}

/*Modal Stuff---------------------------------------
(moved to separate file)*/

//<<<<<<<<< MONEY FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function addMoney() {
    if(gameStarted) {
        
        var money = new Money();
        var moneyType = "&#10027;";
        var addRow = Math.floor(Math.random()*9); //row to put money in
        var addCol = Math.floor(Math.random()*7); //column to put money in
        
        var whatToDo = checkEntity("money",addRow,addCol);
        switch(whatToDo) {
            case "goAhead": break;
            case "increaseValue":
                var refCell = battlefield[addRow][addCol];
                var level = refCell.level;
                if(level === 4) {return} //if highest money possible, do nothing
                
                refCell.level++; //increment level
                refCell.amount+=10; //increment amount
                switch(refCell.level) { //change icon accordingly
                    case 2: moneyType = "&#10028"; break;
                    case 3: moneyType = "&#10026"; break;
                    case 4: moneyType = "&#10023"; break;
                }
            break;
            case "addMoneyToGreen":
                updatePlayerData("money",10,p1);
                return;
            case "addMoneyToBlue":
                updatePlayerData("money",10,p2);
                return;
            case "pushBullet": pushBullet(addRow + 1, addCol + 1, addRow + 1, addCol + 1); break;
        }
        
      var addMoneyContinue = function() {
        if(!pushBulletFinished) {
                //if pushBullet didn't finish, schedule another check and stop executing this function at the moment
            window.setTimeout(addMoneyContinue,50);
            return;
        }
        
        if(whatToDo !== "increaseValue") {battlefield[addRow][addCol] = new Money()}
        /* if not increasing the value of money already present, must mean we're creating a new money (whatToDo was "goAhead" or "pushBullet").
		Add the new money to battlefield. */
        
            //change display
        var addCell = document.getElementById((addRow + 1)+"a"+(addCol + 1)).innerHTML = "<p class='dimYellow'>"+moneyType+"</p>";
        
      }; //end of addMoneyContinue function definition
      addMoneyContinue();
      
    } else {gameStarted = true}
}