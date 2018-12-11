var deckDisplay = document.getElementById("deckDisplay");
var drawButton = document.getElementById("draw");
var resetButton = document.getElementById("reset");
var cardDisplay = document.getElementById("cardDisplay");


var DECK = {
	riot: 3,
	rage: 3,
	reinforcements: 3,
	farms: 2,
	rockfall: 3,
	lostInWoods: 3,
	lucky: 8,
	dragon: 3,
	famine: 2,
	future: 4,
	yourAverageDay: 18,
	babies: 4,
	lightning: 4,
	soldierTraining: 13,
	advance: 2,
	borderPatrol: 3,
	kingdomPatrol: 2,
}

var deck = Object.assign({}, DECK); //working deck
var drawDeck = [];

var deckSize = 0;
for(prop in deck){
	deckSize += deck[prop];
	for(var i=0; i<Number(deck[prop]); i++){
		drawDeck.push(prop);
	}
}
console.log("draw deck",drawDeck);
console.log("deck size",deckSize);


deckDisplay.innerHTML = JSON.stringify(deck).replace(/,/g,"<br>");


drawButton.addEventListener("click", function(){
	for(var i=0; i<4; i++){
		if(drawDeck.length <= 0){return}
		var k;
		do {
			k = drawDeck.splice(Math.floor(drawDeck.length*Math.random()), 1);
		} while(deck[k] <= 0 && drawDeck.length > 0);
		
		cardDisplay.innerHTML = k+"<br>" + cardDisplay.innerHTML;
		deck[k]--;
		deckDisplay.innerHTML = JSON.stringify(deck).replace(/,/g,"<br>");
	}
	cardDisplay.innerHTML = "<br>"+cardDisplay.innerHTML;
});

resetButton.addEventListener("click", function(){
	deck = DECK;
	cardDisplay.innerHTML = "";
	deckDisplay.innerHTML = JSON.stringify(deck).replace(/,/g,"<br>");
	drawDeck = [];
	for(prop in deck){
		for(var i=0; i<Number(deck[prop]); i++){
			drawDeck.push(prop);
		}
	}
});