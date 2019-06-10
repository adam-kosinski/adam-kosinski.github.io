
//Script to load backup text, done with code b/c I'm lazy to type the same thing over a bunch
let audios = document.getElementsByTagName("audio");
for(let i=0; i<audios.length; i++){
	audios[i].innerText = "Your browser doesn't appear to support web audio. Some browsers that do: the most recent versions of Chrome and Microsoft Edge";
}


let html = document.getElementsByTagName("html")[0];
let backImg = document.getElementById("background");
backImg.style.width = html.clientWidth + "px";