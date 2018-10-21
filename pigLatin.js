//define functions --------------------

function textNodesIn(el){
	var textNodes = [];
	var n; //current node
	var treeWalker = document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
		//args: root node, whatToShow property, additional filter, entityReferenceExpansion(some weird thing when parsing)
	
	while(n = treeWalker.nextNode()){textNodes.push(n)}
	//condition calls nextNode function, moving the tree walker to next node (and setting n to this to improve efficiency)
	//if there is no next node, condition evaluates to false
	
	return textNodes;
}

function alterWord(word){
	var isCapitalized = /[A-Z]/.test(word[0]);
	
	//if first letter is a vowel, add 'way' to end
	if(/a|e|i|o|u/i.test(word[0])){
		word = word + "way";
	} else { //otherwise move all beginning consonants to end and add 'ay'
		word = word.replace(/(^[^aeiou]+)(.*)/i,"$2$1ay"); //'$1' is 1st parentheses (the consonants at beginning), '$2' is 2nd paren. (rest of word)
	}
	
	//take care of capitalization
	word = word.toLowerCase();
	if(isCapitalized){word = word.replace(/^\w/,function(match){return match.toUpperCase()})}
	
	return word;
}

function alterText(text){
	//call alterWord for each word, replace with what it returns
	return text.replace(/[A-Za-z']+/g, function(match){return alterWord(match)});
}



//execute file on document --------------------------

var body = document.getElementsByTagName("body")[0];
var textNodes = textNodesIn(body);

for(var i=0,l=textNodes.length; i<l; i++){
	if(textNodes[i].parentNode.nodeName !== "SCRIPT"){ //don't mess with javascript
		textNodes[i].textContent = alterText(textNodes[i].textContent);
	}
}