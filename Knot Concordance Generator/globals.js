let input_canvas = document.getElementById("input");
let input_button = document.getElementById("input_button");
let generate_concordance_button = document.getElementById("generate_concordance");

let display_canvas = document.getElementById("display");
let concordance_table = document.getElementById("concordance_table");

let POINT_SELECT_RADIUS = 5; //px, radius around point's (x,y) in which we consider the point clicked
let UNDERSTRAND_GAP = 5; //px, gap between an understrand and the crossing's center
let ARROW_SIZE = 5; //px, length & width of arrows drawn on strands to show orientation

let BAND_WIDTH = 10; //px, width of band we wind around everywhere.

let R2_DIST_FROM_STRAND = 13; //px, the band goes to a point this far from the strand before doing a reidemeister 2 move under or over the strand
	//note: can't equal 0.5*BAND_WIDTH, this will cause an intersection-at-point error in Band.doR2() for strands marked 'band'
let R2_MIN_STRAND_LENGTH = 1.5*BAND_WIDTH; //minimum length a strand must be for the band to be able to reidemeister 2 under/over it
let R2_CLOSE_ENOUGH_RADIUS = 10;

let input = new State();
let display; //stores the state being currently displayed
let entries = []; //will be filled with State objects as more ribbon concordances are generated

//zoom objects (hold info about zoom stuff)
let input_zoom = {
	mode: "normal", //options: "normal", "zoom-in", "move", "zoom-out"
	dragging: false,
	mouse: {x: undefined, y: undefined}, //stores prev mouse coords, used only for dragging functionality
	ctx: input_canvas.getContext("2d"),
	scale: 1,
	origin: {x: 0, y: 0} //in ctx coords, where the top-left canvas corner is
}

let display_zoom = {
	mode: "normal", //options: "normal", "zoom-in", "move", "zoom-out"
	dragging: false,
	mouse: {x: undefined, y: undefined}, //stores prev mouse coords, used only for dragging functionality
	ctx: display_canvas.getContext("2d"),
	scale: 1,
	origin: {x: 0, y: 0} //in ctx coords, where the top-left canvas corner is
}

let ZOOM_FACTOR = 2; //each time you zoom in/out, the scale gets multiplied/divided by this factor. Must be greater than 1



let s = input.strands; //for debugging convenience

//bigger precision helps avoid errors w/ alex poly calculation in State.js
math.config({
	precision: 128
});


/*notes:
BUG: getting errors when trying to compute alex poly for inputs that the undo feature was used to draw

BUG: adding a new strand that goes straight through an existing point, doesn't register as a crossing - currently throwing an error (intersection at point) to deal with this
Still getting intersections at endpoints that I don't want, despite the change to the newStrand() function in state.js
Probably has something to do about how new strands are recursively split up
	-Intersection at point happens when either a) draw a strand through a previous point, b) draw a strand, ending on a previous strand

BUG/missing feature: region won't be correctly detected if there are multiple components - big region and technically smaller regions
-> deal with this in the band generation code?
- not sure if I can just concatenate the strand arrays for all the other regions, I think it will mess up some of the region's methods - check though
- can check if "inside the region" is facing outwards, and also check if all the region's strands/points are within another region - if so, both strand sets are for the same region
- Also Mathematica fails to do the Alexander polynomial for links (2+ components)

BUG: when merging, the first addStep can intersect the merge strand (despite the check for this, b/c the band is to the left and right of the center)

BUG: Alexander polynomial sometimes has a bunch of extra 0s and then an incorrect +/- 1 at the end. The polynomial before the zeros is correct though
--> this is round-off/floating point error. Fix is to increase the math.config precision (see above)

NOTE: Currently alexander polynomial doesn't work for links

-----------------------

Make flipping crossings un-doable?

Add a way to save results to a file, and to upload them

Add intersection at point checking for when inputting a knot? - SnapPy does the flash-screen thing

isR2Valid needs to check if points to the left AND right of the primary r2 point are inside the region, so we don't get
the band's left strand ending in the region and the band's right strand ending JUST... outside the region

Consider using R2_CLOSE_ENOUGH_RADIUS to combat intersection at point, by picking a different r2 point within the radius and trying that

Would like to add: better rendering for TINY strands with one over-crossing and one under-crossing

Zoom in/out feature for displays?

*/