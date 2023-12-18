var selector = "script"; //elements to not perform the function on (remove from copy of DOM)

var docCopy = document.documentElement.cloneNode(true); //true for deep copy
var elsToRemove = docCopy.querySelectorAll(selector);

for(var i=0,l=elsToRemove.length; i<l; i++){
	elsToRemove[i].parentElement.removeChild(elsToRemove[i]);
}