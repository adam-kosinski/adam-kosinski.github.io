const path = require("path");
const express = require("express");
const app = express();

if(process.argv.length < 3){
    console.log("Please include a path to the HTML file as a command line argument");
    process.exit();
}

const html_path = process.argv[2];
const directory = path.dirname(html_path);

app.use(express.static(directory));

app.get("/", function(req, res){
    res.sendFile(html_path);
});

const port = process.env.PORT || 8000;
app.listen(8000, function(){
    console.log("Listening on port " + port)
});