const path = require("path");
const express = require("express");
const { dir } = require("console");
const app = express();

if(process.argv.length < 3){
    console.log("Please include a path to the HTML file as a command line argument");
    process.exit();
}

const html_path = process.argv[2];
const directory = path.dirname(html_path);
console.log(html_path, directory)

//need to call app.get() first, since if we use express.static first it will default to index.html always
app.get("/", function(req, res){
    res.sendFile(path.resolve(html_path)); //convert path to absolute
});

app.use(express.static(directory));

const port = process.env.PORT || 8000;
app.listen(8000, function(){
    console.log("Listening on port " + port)
});