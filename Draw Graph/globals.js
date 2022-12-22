//html references
var canvas = document.getElementById("canvas");
var canvas_width_fraction = 0.7; //fraction of window width the canvas takes up, the rest is taken up by the instructions
	// IF UPDATE THIS ALSO UPDATE #instructions IN THE CSS

var ctx = canvas.getContext("2d");
var mode_display = document.getElementById("mode");
var instructions = document.getElementById("instructions");
var M_adj_display = document.getElementById("M_adj_display");
var mainHitCanvas = document.getElementById("mainHitCanvas");
var mainHitCtx = mainHitCanvas.getContext("2d");
var hitCanvases = document.getElementById("hitCanvases");

//graph data
var M_adj = []; //adjacency matrix
var vertices = []; //stores html divs that are vertices, with the same index as in M_adj - so we can identify their index in M_adj

//mode
var mode = "move vertex"; //this is the default mode. Other modes: "add vertex" "add edge" "delete" "change label"

//flag for showing labels or not
var showLabels = false;

//for deleting
var shadowedEdge; //stores which edge is shadowed red for the delete mode, of form [v1,v2,n] (same as hit canvas ids - see HTML file)


//for adding edges:
var verticesForEdge = []; //array length 2 of the indices of the two vertices the new edge will be incident to, stored in a global variable b/c 2 diff events are needed to fill it
var vertexEdgeAngles = []; //stores angles that edges come off of vertices, used when drawing loops, and modified in updateCanvas() when an arg passed (in addEdge(), when deleting, and when dragging)
	//format of entries: {loops:[], straightEdges:[]}


//for dragging:
var draggedVertex; //if this has a value (HTML vertex), we are dragging