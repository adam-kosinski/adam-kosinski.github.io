/* Joseph's idea: have each level of aircraft only be able to provide a certain amount of moves.
For example, one might only be able to gain a maximum 3 moves from purchasing level 1 aircrafts.*/







/*TABLE OF Z-INDEXES
0 - positioned stuff
1 - inventories, to create stacking contexts above other stuff, dragging forcefield (so can click on aircrafts), bullets
2 - static object on battlefield, battlefield itself to create a stacking context
5 - dragging object on battlefield
10 - modal
15 - an element being animated w/ riseElement()
20 - click disabler

*/

//<<<<<<<<< VARIABLES >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
var gameStarted = false; //used to determine when to start placing money down

//---PLAYER-INFO-VARIABLES-----------

function Inventory() {
    this.bullets = [0,0,0,0,0];
    this.forcefields = 0;
    this.healers = 0;
    this.bombs = 0;
    this.poisons = 0;
    this.antidotes = 0;
}

var p1 = { //keys alphabetically organized
	color: "green",
	discount: 0,
	inventory: new Inventory(),
	money: 500,
	moves: 10,
	movesLeft: 10,
	pNumber: 1
};

var p2 = { //keys alphabetically organized
	color: "blue",
	discount: 0,
	inventory: new Inventory(),
	money: 100,
	moves: 10,
	movesLeft: 10,
	pNumber: 2
};

var p = p2; //p is the current player
//since togglePlayerTurn is called at the end of the HTML document (to initialize everything), p will effectively start out as p1

/*A BIT OF EXPLANATION:
-p1 and p2 are both objects containing the players' data
-when p gets set to p1 or p2, p is REFERENCING one of those two objects; no new object is created
  -this means that if the movesLeft value of p is changed, this changes the movesLeft value of either p1 or p2, depending
   on which object p is referencing
-thus, p is just a convenient way of referring to one of the players' data, namely the current player
*/

//---- ABSOLUTE COSTS, STATS, AND OTHER INFO
var gameInfo = { //no plurals in property names
	aircraft: {
		cost: [10,20,35,80,120],
		life: [10,20,40,100,150],
		discount: [],
		sellPrice: [],
		movesAdded: [1,1,1,2,2],
		destructionAward: [10,10,10,10,10],  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! INCORRECT AMOUNTS - FIX !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	},
	bullet: {
		cost: [10,15,25,45,85],
		damage: [5,10,20,40,80],
		speed: [1,1,1,2,2],
		sellPrice: [5,10,20,35,75],
	},
	item: {
		cost: [25,40,50,200,85],
	}
};

//---COSTS-------------------------

	//these change depending on discount
var aircraftCosts = gameInfo.aircraft.cost.slice();
var bulletCosts = gameInfo.bullet.cost.slice();
var itemCosts = gameInfo.item.cost.slice();
//.slice() creates a new identical array, if didn't use it, 'aircraftCosts' and 'gameInfo.aircraft.cost' would refer to the same array

var allCosts = [aircraftCosts,bulletCosts,itemCosts]; //to allow easier access when looping (w/o switch statements)

//<<<<<<<<< SCREEN CHANGE FUNCTION >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function changeScreen(screen) {
        //Clear current interface
    document.getElementById("mainInterface").style.display = "none";
	document.getElementById("aircraftShop").style.display = "none";
	document.getElementById("bulletShop").style.display = "none";
	document.getElementById("itemShop").style.display = "none";
    
        //Load new interface
    switch(screen) {
        case "main":
            document.getElementById("mainInterface").style.display = "block";
            break;
        case "aircraft":
            document.getElementById("aircraftShop").style.display = "block";
            break;
        case "bullet":
            document.getElementById("bulletShop").style.display = "block";
            break;
        case "item":
            document.getElementById("itemShop").style.display = "block";
            break;
    }
}

//<<<<<<<<< CHANGE-PLAYER-MOVE FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function togglePlayerTurn() {
    /*useMove() takes care of resetting move display and player 'movesLeft' value*/
	
    if(p.pNumber === 1) { //-COMPLICATED/SPECIFIC-DIFFERENCES-------------------------------------------
        p = p2;
        
            //change notification button
        document.getElementById("playerTurnDisplay").style.backgroundColor = "#00ffff";
        document.getElementById("playerTurnDisplay").style.border = "3px solid blue";
        document.getElementById("playerTurnDisplay").innerHTML = "Player 2's Turn";
    }
    else if(p.pNumber === 2) {
        p = p1;
        
            //change notification button
        document.getElementById("playerTurnDisplay").style.backgroundColor = "#66ff88";
        document.getElementById("playerTurnDisplay").style.border = "3px solid green";
        document.getElementById("playerTurnDisplay").innerHTML = "Player 1's Turn";
    } //-COMPLICATED-DIFFERENCES--------------------------------------------------------------------------
    
    updateDiscount();
    
    figureOutBuyables();
    
        //add money to battlefield
    addMoney();
}

//<<<<<<<<< UPDATE FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function updatePlayerData(type,changeAmount,player) { //player argument should be the player object (p1 or p2)
	switch(type) {
		case "money":
			console.log("player"+player.pNumber,"+$"+ changeAmount)
			player.money += changeAmount;
			document.getElementById(player.color+"Money").textContent = player.money;
			figureOutBuyables();
		break;
		case "moves":
			player.moves += changeAmount;
			document.getElementById(player.color+"Moves").textContent = player.moves;
		break;
	}
    
}

function updateDiscount() {
    bulletCosts = gameInfo.bullet.cost.slice(); //reset bullet costs to normal (w/o discount applied)
    for(var bRow = 0; bRow < 5; bRow++) { // subtract discount for each row
        bulletCosts[bRow] = Math.max(bulletCosts[bRow] - p.discount, 0); //Math.max ensures lowest new price is 0 (reverts to 0 if difference is negative)
        
		//update shop display
        document.getElementById("bullet" + (bRow + 1) + "Cost").textContent = bulletCosts[bRow];
    }
}

//determines if things buyable or not, and sets class, style, and onclick attributes accordingly
function figureOutBuyables() {
    //disable buying functions
	//!!!!!!!!!!!!!!!!!!!! BLANK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
	var shop; //iterator for the three shops
    
		//set all to buyable
    for(var r = 1; r <= 5; r++) {
        for(shop = 0; shop < 3; shop++) {
            var selectedRow = document.getElementsByClassName("row" + r)[shop];
            selectedRow.className = "row" + r + " buyable";
            
            switch(shop) {
                case 0: selectedRow.setAttribute("onclick","buyAircraft("+r+");changeScreen('main')"); break;
                case 1: selectedRow.setAttribute("onclick","buyBullet("+r+");changeScreen('main')");break;
				//!!!!!!!!!!!!!!!! DON'T FORGET ITEM SHOP !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            }
        }
    }
    
		//figure out if buyable or not buyable
    for(shop = 0; shop < 3; shop++) {
        for(var shopRow = 1; shopRow <= 5; shopRow++) {
				//make unbuyable if not enough money
			if(p.money < allCosts[shop][shopRow - 1]) {
                var unbuyableRow = document.getElementsByClassName("row" + shopRow)[shop];
                unbuyableRow.className = "row" + shopRow;
                unbuyableRow.removeAttribute("onclick");
            }
        }
    }
    
        //enable buying functions
	//!!!!!!!!!!!!!!!!!!!! BLANK !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}

function useMove() {
	p.movesLeft -= 1;
	document.getElementById(p.color+"Moves").textContent = p.movesLeft;
	
	if(p.movesLeft <= 0) {
		p.movesLeft = p.moves;
		document.getElementById(p.color+"Moves").textContent = p.movesLeft;
		togglePlayerTurn();
	}
}

//<<<<<<<<< AIRCRAFT, BULLET, DIRECTION ICON, AND FORCEFIELD DRAWING FUNCTIONS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
function drawBullet(canvasId,color,type,rotate) {
    var canvas = document.getElementById(canvasId);
    
    switch(type) {
        case 1:
            canvas.setAttribute("width","24");
            canvas.setAttribute("height","24");
            canvas.style.width = "24px";
            canvas.style.height = "24px";
        break;
        case 2:
            canvas.setAttribute("width","24");
            canvas.setAttribute("height","24");
            canvas.style.width = "24px";
            canvas.style.height = "24px";
        break;
        case 3:
            canvas.setAttribute("width","24");
            canvas.setAttribute("height","24");
            canvas.style.width = "24px";
            canvas.style.height = "24px";
        break;
        case 4:
            canvas.setAttribute("width","14");
            canvas.setAttribute("height","36");
            canvas.style.width = "14px";
            canvas.style.height = "36px";
        break;
        case 5:
            canvas.setAttribute("width","14");
            canvas.setAttribute("height","36");
            canvas.style.width = "14px";
            canvas.style.height = "36px";
        break;
    }
    
    var ctx = canvas.getContext("2d");
    
    if(type === 4 || type === 5) {
        switch(rotate) {
            case "up":
                ctx.rotate(0);
            break;
            case "right":
                canvas.setAttribute("width","36");
                canvas.setAttribute("height","14");
                canvas.style.width = "36px";
                canvas.style.height = "14px";
                
                ctx.translate(canvas.width,0);
                ctx.rotate(0.5 * Math.PI);
            break;
            case "down":
                ctx.translate(canvas.width,canvas.height);
                ctx.rotate(Math.PI);
            break;
            case "left":
                canvas.setAttribute("width","36");
                canvas.setAttribute("height","14");
                canvas.style.width = "36px";
                canvas.style.height = "14px";
                
                ctx.translate(0,canvas.height);
                ctx.rotate(1.5 * Math.PI);
            break;
        }
    }
    
    if(color === "green") {ctx.fillStyle = "rgb(102,255,136)"}
    if(color === "blue") {ctx.fillStyle = "rgb(0,255,255)"}

    ctx.strokeStyle = "rgba(0,0,0)";
    ctx.lineWidth = 2;
    
    ctx.translate(1,1); //so sides/corners don't get chopped off
    
    switch(type) {
        case 1:
            ctx.beginPath();
            ctx.arc(11,11,11,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(11,11,3,0,2*Math.PI);
            ctx.closePath();
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.lineWidth = 2;
        break;
        case 2:
            var outCir = Math.sqrt(60.5);
            
            ctx.beginPath();
            ctx.moveTo(11,0);
            ctx.lineTo(13.5,5);
            ctx.lineTo(11 + outCir,11 - outCir);
            ctx.lineTo(17,8.5);
            ctx.lineTo(22,11);
            ctx.lineTo(17, 13.5);
            ctx.lineTo(11 + outCir,11 + outCir);
            ctx.lineTo(13.5,17);
            ctx.lineTo(11,22);
            ctx.lineTo(8.5,17);
            ctx.lineTo(11 - outCir,11 + outCir);
            ctx.lineTo(5,13.5);
            ctx.lineTo(0,11);
            ctx.lineTo(5,8.5);
            ctx.lineTo(11 - outCir, 11 - outCir);
            ctx.lineTo(8.5,5);
            
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
        case 3:
            ctx.beginPath();
            ctx.arc(11,11,11,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(11,11,3,0,2*Math.PI);
            ctx.closePath();
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.lineWidth = 2;
            
            outCir = Math.sqrt(60.5);
            
            ctx.beginPath();
            ctx.moveTo(11 - outCir,11 - outCir);
            ctx.lineTo(11 + outCir,11 + outCir);
            ctx.moveTo(11 + outCir,11 - outCir);
            ctx.lineTo(11 - outCir,11 + outCir);
            ctx.moveTo(11,0);
            ctx.lineTo(11,22);
            ctx.moveTo(0,11);
            ctx.lineTo(22,11);
            ctx.stroke();
            ctx.closePath();
        break;
        case 4:
            ctx.beginPath();
            ctx.moveTo(6,0);
            ctx.lineTo(12,14);
            ctx.lineTo(12,33);
            ctx.lineTo(0,33);
            ctx.lineTo(0,14);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
        case 5:
            ctx.beginPath();
            ctx.moveTo(6,0);
            ctx.lineTo(12,14);
            ctx.lineTo(12,33);
            ctx.lineTo(0,33);
            ctx.lineTo(0,14);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(6,0);
            ctx.lineTo(6,33);
            ctx.stroke();
            ctx.closePath();
        break;
    }
}

function drawAircraft(canvasId,color,type) {
    var canvas = document.getElementById(canvasId);
    
    switch(type) {
        case 1:
            canvas.setAttribute("width","31");
            canvas.setAttribute("height","50");
            canvas.style.width = "31px";
            canvas.style.height = "50px";
        break;
        case 2:
            canvas.setAttribute("width","31");
            canvas.setAttribute("height","50");
            canvas.style.width = "31px";
            canvas.style.height = "50px";
        break;
        case 3:
            canvas.setAttribute("width","31");
            canvas.setAttribute("height","62");
            canvas.style.width = "31px";
            canvas.style.height = "62px";
        break;
        case 4:
            canvas.setAttribute("width","34");
            canvas.setAttribute("height","62");
            canvas.style.width = "34px";
            canvas.style.height = "62px";
        break;
        case 5:
            canvas.setAttribute("width","43");
            canvas.setAttribute("height","87");
            canvas.style.width = "37px";
            canvas.style.height = "75px";
        break;
    }
    
    var ctx = canvas.getContext("2d");
    
    var opacity = 1;
    if(type === 5) {opacity = 0.5}
    
    if(color === "green") {ctx.fillStyle = "rgba(102,255,136,"+opacity+")"}
    if(color === "blue") {ctx.fillStyle = "rgba(0,255,255,"+opacity+")"}

    ctx.strokeStyle = "rgba(0,0,0,"+opacity+")";
    ctx.lineWidth = 2;
    
    ctx.translate(1,1); //so sides/corners don't get chopped off
    
    switch(type) {
        case 1:
            ctx.fillRect(12,0,5,22);
            ctx.strokeRect(12,0,5,22);
            
            ctx.beginPath();
            ctx.moveTo(0,22);
            ctx.lineTo(29,22);
            ctx.lineTo(15.5,48);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
        case 2:
            ctx.fillRect(5,0,5,22);
            ctx.strokeRect(5,0,5,22);
            
            ctx.fillRect(18,0,5,22);
            ctx.strokeRect(18,0,5,22);
            
            ctx.beginPath();
            ctx.moveTo(0,22);
            ctx.lineTo(29,22);
            ctx.lineTo(15.5,48);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
        case 3:
            ctx.beginPath();
            ctx.moveTo(11,12);
            ctx.lineTo(20,12);
            ctx.lineTo(15.5,0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.fillRect(10,12,10,22);
            ctx.strokeRect(10,12,10,22);
            
            ctx.beginPath();
            ctx.moveTo(0,34);
            ctx.lineTo(29,34);
            ctx.lineTo(15.5,60);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
        case 4:
            ctx.beginPath();
            ctx.moveTo(11,12);
            ctx.lineTo(20,12);
            ctx.lineTo(15.5,0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(10,19);
            ctx.lineTo(3,33);
            ctx.moveTo(21,19);
            ctx.lineTo(28,33);
            ctx.stroke();
            ctx.closePath();
            
            ctx.fillRect(10,12,10,22);
            ctx.strokeRect(10,12,10,22);
            
            ctx.beginPath();
            ctx.moveTo(1,34);
            ctx.lineTo(30,34);
            ctx.lineTo(16.5,60);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(2.5,35,2.5,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(29.5,34.5,2.5,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
        case 5:
            ctx.beginPath();
            ctx.moveTo(16,12);
            ctx.lineTo(25,12);
            ctx.lineTo(20.5,0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(15,19);
            ctx.lineTo(8,33);
            ctx.moveTo(26,19);
            ctx.lineTo(33,33);
            ctx.stroke();
            ctx.closePath();
            
            ctx.fillRect(15,12,10,22);
            ctx.strokeRect(15,12,10,22);
            
            ctx.beginPath();
            ctx.moveTo(6,34);
            ctx.lineTo(35,34);
            ctx.lineTo(21.5,60);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(7.5,35,2.5,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(34.5,34.5,2.5,0,2*Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(9,39);
            ctx.lineTo(9,65);
            ctx.lineTo(16,53);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(32,39);
            ctx.lineTo(32,65);
            ctx.lineTo(25,53);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0,52);
            ctx.lineTo(41,52);
            ctx.lineTo(20.5,85);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        break;
    }
}

function clearCanvas(canvasId) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    ctx.clearRect(-10, -10, canvas.width + 20, canvas.height + 20); //also clears a 10px boundary around the canvas to get rid of slight 'spills'
																	//not sure if necessary...
}