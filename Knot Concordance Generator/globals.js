let input_canvas = document.getElementById("input");
let input_button = document.getElementById("input_button");
let generate_concordance_button = document.getElementById("generate_concordance");

let display_canvas = document.getElementById("display");
let concordance_table = document.getElementById("concordance_table");

let POINT_SELECT_RADIUS = 5; //px, radius around point's (x,y) in which we consider the point clicked
let UNDERSTRAND_GAP = 5; //px, gap between an understrand and the crossing's center
let ARROW_SIZE = 5; //px, length & width of arrows drawn on strands to show orientation

let BAND_WIDTH = 10; //px, width of band we wind around everywhere.

let R2_DIST_FROM_STRAND = 15; //px, the band goes to a point this far from the strand before doing a reidemeister 2 move under or over the strand
let R2_MIN_STRAND_LENGTH = 1.5*BAND_WIDTH;

let input = new State();
let entries = []; //will be filled with State objects as more ribbon concordances are generated


let s = input.strands; //for debugging convenience




/*notes:
BUG: adding a new strand that goes straight through an existing point, doesn't register as a crossing - currently throwing an error (intersection at point) to deal with this
Still getting intersections at endpoints that I don't want, despite the change to the newStrand() function in state.js
Probably has something to do about how new strands are recursively split up
	-Intersection at point happens when either a) draw a strand through a previous point, b) draw a strand, ending on a previous strand

BUG/missing feature: big region won't be correctly detected if there are multiple components
-> probably deal with this in the band generation code?
- not sure if I can just concatenate the strand arrays for all the other regions, I think it will mess up some of the region's methods - check though
- Also Mathematica fails to do the Alexander polynomial for links (2+ components)

Iffy feature: ordered_indices in State object becomes wrong when strands are sorted - make better
-> probably store ordered_strands, not ordered_indices. Also should determine this in the orient strands method, not the ID strands one

BUG: when merging, the first addStep can intersect the merge strand (despite the check for this, b/c the band is to the left and right of the center)

-----------------------

isR2 valid needs to check if points to the left AND right of the primary r2 point are inside the region, so we don't get
the band's left strand ending in the region and the band's right strand ending JUST... outside the region

Have a different method of doing R2 for band strands - go straight through the band
-issue if the band's tip ends up in the middle of the band

To avoid band weirdness, have a radius around the first r2 point (or pre-merge point), where if the tip is in the radius, consider it at the r2 point
	-can also use this to combat intersection at point if we want, by picking a different r2 point within the radius and trying that

Would like to add: better rendering for TINY strands with one over-crossing and one under-crossing

Want to add ctrl+Z feature for entering a knot

Zoom in/out feature for displays?

*/