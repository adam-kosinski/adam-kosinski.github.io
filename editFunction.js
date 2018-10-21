function doStuff(){
	console.log("hi");
}

doStuff(); //logs 'hi'

var strFn = String(doStuff).replace(/^function\s.*{|}/g,""); //stores function in a string
	
	//strFn is "console.log('hi')" in this case
strFn += ";console.log('hello')";

doStuff = Function(strFn);

doStuff(); //logs 'hi' 'hello'