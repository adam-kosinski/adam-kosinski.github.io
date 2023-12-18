function reduce(n,d) {
	if(isNaN(n) || isNaN(d)) {return NaN} //check n, d, and output arguments
	
	//gcd (greatest common divsor) function of two numbers, a and b
	var gcd = function(a,b) {
		return b ? gcd(b,a%b) : a;
	}
	//get gcd
	var GCD = gcd(n,d);
	//divide numerator and denominator by gcd, return
	return [n/GCD, d/GCD];
}



function practiceTrig(mode,nOfCycles,negPossible) {

	if(!nOfCycles) {nOfCycles = 1}

	var normalProblem = function() {
		/*VARIABLES USED IN MULTIPLE SPOTS-------------*/
		var disp = ""; //storage container for question display
		var ans; //answer (determined by computer when trigFunc is being defined)
		var neg = (negPossible ?
					Math.floor(Math.random()*2) //0 or 1 value (false or true)
					: 0); //if 'negPossible' is false, angle isn't negative
		var trigFunc;
		
		var n; //angle numerator, will be * pi
		var d=12; //angle denominator
		do {
			n = Math.floor(Math.random()*24*nOfCycles); //generate random angle numerator value: 0 to (24 * number of cycles)
		} while(!(n%2===0 || n%3===0));
		//keep trying until numerator is divisible by either 2 or 3 -> yields unit circle value I know (denominator = 12)
		
		/*REST OF FUNCTION------------*/
		//reduce fraction
		reducedFrac = reduce(n,d);
		n = reducedFrac[0];
		d = reducedFrac[1];
		
		//put angle into disp variable (is a string)
		if(n === 0) {disp = "0"}
		else{
			disp += "\u03c0" //means pi, will be present if n doesn't equal 0
			if(n !== 1) {disp = n + disp} //if num isn't 1, n will be before the pi
			if(d !== 1) {disp = disp + "/" + d} //if denom isn't 1, it will be pegged onto the end with a "/"
			if(neg) {disp = "-" + disp} //if negative angle '-' sign on front
		}
		//determine trig function and evaluate correct answer
		var angVal = (n*Math.PI)/d; //get angle value that the computer can understand
		if(neg){angVal *= -1} //make it negative if 'neg' is true
		trigFunc = Math.ceil(Math.random()*6);
		switch(trigFunc) {
			case 1: trigFunc = "sin"; ans=Math.sin(angVal); break;
			case 2: trigFunc = "cos"; ans=Math.cos(angVal); break;
			case 3: trigFunc = "tan"; ans=Math.tan(angVal); break;
			case 4: trigFunc = "csc"; ans=1/Math.sin(angVal); break;
			case 5: trigFunc = "sec"; ans=1/Math.cos(angVal); break;
			case 6: trigFunc = "cot"; ans=1/Math.tan(angVal); break;
		}

		if(Math.abs(ans) > 100 /*some arbitrarily big #*/) {ans = "undefined"} /*for recip. funcs. computer does something like 1/0.0000000000001 = big,
																				because Math.PI isn't perfect, really it should be 1/0 = undefined*/
		
		disp = trigFunc + "(" + disp + ")"; //put trig function into display
		
		executeQ(disp,ans);
	}

	var inverseProblem = function() {
		
	}
	
	var executeQ = function(disp,ans){ //function defined to allow same question to be asked again and to avoid repetition
		var response = prompt(disp); //ask question to user
		//type something, hit OK -> string w/ input
		//type nothing, hit OK   -> empty string
		//hit cancel             -> null
		
		if(typeof response === "string") {
			var parseResult = parseInput(response); //call parsing function

			if(parseResult === "error") {
				alert(disp+"\u000aSomething was wrong with your input: \""+response+"\"\u000aTry again."); // \u000a is line break
				executeQ(disp,ans);
				return;
			}

			//round to nearest thousandth to correct for inexactness of computer
			if(typeof parseResult === "number" && typeof ans === "number") {
				parseResult = Math.round(parseResult * 1000) / 1000;
				ans = Math.round(ans * 1000) / 1000;
			}console.log(parseResult,ans,disp)
			
			//check if correct, in either case alert correct/incorrect, question, and given answer
			if(parseResult === ans) {alert("Correct!\u000a\u000a"+disp+"\u000aYour answer: "+response)}
			else {
				alert("Incorrect.\u000a\u000a"+disp+"\u000aYour answer: "+response+"\u000aTry again.");
				executeQ(disp,ans);
			}

			if(mode==="normal"){normalProblem()}
			if(mode==="inverse"){inverseProblem()}
		}
		else{} //if prompt returned null, do nothing, ending the program
	}
	
	var parseInput = function(input) { //should return "undefined" or a number
		//CHECK INPUT FOR VALIDITY (AND SPLIT INPUT INTO ndArray)---------------
		
		//empty strings not allowed
		if(input.length === 0) {return "error"}
		
		//only things allowed are: 0-9,(,),pi,undefined,/,-
		if((input.replace(/\d|\(|\)|pi|undefined|\/|-/g,"")).length > 0) {return "error"} //remove all allowed things, if anything left, problem
		
		//if 'undefined' present, there shouldn't be anything else
		if(/undefined/.test(input) ? (input.replace(/undefined/,"").length > 0) : false) {return "error"}
			//if 'undefined' present, remove ONE instance of 'undefined', if anything left, problem; if 'undefined' not present, nothing happens
		
		//'-' should only be at beginning
		if(/-/g.test(input.substring(1))) {return "error"} //test for '-' in substring starting from index=1 to end of string, if test positive, problem
		
		//there shouldn't be a '/' at beginning or end
		if(/(^\/)|(\/$)/.test(input)) {return "error"} //test for '/' at beginning or end, if test positive, problem
		
		//max 1 of '/', can conveniently split input here as well
		var ndArray = input.split("/");
		if(ndArray.length > 2) {return "error"} //split the input at '/', if length of resulting array is > 2 (means there were 2+ of '/'), problem
		
		//no radical in denominator (simplest radical form)
		if(/\(|\)/g.test(ndArray[1])) {return "error"} //test denominator for '(' or ')', if present, problem
		
		//only one pair of () in numerator, open parentheses must be closed, and () must contain something
		var nOParen = (/\(/.test(ndArray[0]) ? ndArray[0].match(/\(/g).length : 0); //number of open parentheses in numerator
		var nCParen = (/\)/.test(ndArray[0]) ? ndArray[0].match(/\)/g).length : 0); //number of close parentheses in numerator
			//for both cases, use ternary operator to first check if parentheses present, if not -> 0. (don't want string.match() to return null)
		if(nOParen>1 || nCParen>1 || (nOParen !== nCParen)) {return "error"} //if more than one of either type, or not the same amount of each type, problem
		if(nOParen) { //if parentheses do exist...
			if(ndArray[0].search(/\(/) + 1 >= ndArray[0].search(/\)/)) {return "error"}; //...make sure the open parentheses comes before the close parentheses
																							//and that the open-parentheses index is at least two less than the
																							//close-parentheses index (so the parentheses contain something)
		}
		
		
		//PARSE INPUT ------------------------------------------
		
		if(input === "undefined") {return "undefined"}
		
		//if no denominator from the split, assume it = "1"
		if(!ndArray[1]) {ndArray[1] = "1"};
		
		//define evalExp (evaluateExpression function), can evaluate multiplication for things with: 0-9, non-nested (), pi, -
		var evalExp = function(exp) {
			if(!exp) {return NaN} //if no input - which should never happen - return NaN
			
			var mCont = 1; //'multiplication container', items will be coalesced into this through multiplication
			
			//evaluate radicals, if they exist
			//find radicals, remove stuff in them, store that as new 'exp' (reason: see last comment in this section)
			exp = exp.replace(/\([^()]+\)/g,function(match){ //locate all () with something inside them except for other parentheses
				var underRadValue = evalExp(match.substring(1,match.length - 1)); //call evalExp on what's inside the parentheses
				mCont *= Math.sqrt(underRadValue); //multiply fully evaluated radical into mCont
				return "()"; //replace evaluated radicals with a placeholder, i.e. 23(45)56 -> 23()56 not 2356
							//-placeholder is so that when the program looks for plain numbers, it won't find stuff in radicals
			});
			
			//multiply all plain numbers into mCont, using string.replace() b/c it can execute a function for EACH match (no for loop)
			exp.replace(/\d+/g,function(match){
				mCont *= Number(match);
				return; //not storing exp.replace() in anything here, doesn't matter what the return value is
			});
			
			//find all "pi"s, multiply them into mCont
			exp.replace(/pi/g,function(match){
				mCont *= Math.PI;
				return; //same thing as for numbers
			});
			
			//if '-' at beginning, multiply by -1
			if(/^-/.test(exp)) {mCont *= -1}
			
			//return final value
			return mCont;
		};
		
		return evalExp(ndArray[0])/evalExp(ndArray[1]); //return numerator/denominator
	}

	if(mode === "normal") {normalProblem()}
	if(mode === "inverse") {inverseProblem()}
}
