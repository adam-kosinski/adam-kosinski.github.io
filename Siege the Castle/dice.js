var dice = document.getElementById("dice");
var info = document.getElementById("info");
var timer = document.getElementById("timer");
var startTimerButton = document.getElementById("startTimer");

var diceFaces = [
	{value: "Breed", color: "orange"},
	{value: "Move", color: "lightgreen"},
	{value: "Move", color: "lightgreen"},
	{value: "Resource/Give", color: "red"},
	{value: "Craft", color: "red"},
	{value: "Troops", color: "red"}
];

function roll(){
	info.textContent = "Rolling...";
	setTimeout(function(){
		let result = diceFaces[Math.floor(diceFaces.length*Math.random())];
		dice.textContent = result.value;
		dice.style.backgroundColor = result.color;
		info.textContent = "";
	}, 1000);
}

dice.addEventListener("click", roll);

roll();


//also handle the timer here
var timeElapsed = 0; //in seconds
var intervalID;
function startTimer(){
	intervalID = setInterval(function(){
		timeElapsed += 1;
		let sec = timeElapsed%60;
		if(sec < 10){sec = "0"+sec}
		timer.textContent = Math.floor(timeElapsed/60) + ":" + sec;
		if(timeElapsed >= 120){
			timeElapsed = 0;
			alert("Timer finished");
			clearInterval(intervalID);
		}
	},1000);
}

startTimerButton.addEventListener("click",startTimer);