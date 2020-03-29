let input_canvas = document.getElementById("input");
let input_button = document.getElementById("input_button");
let generate_concordance_button = document.getElementById("generate_concordance");

let display_canvas = document.getElementById("display");
let concordance_table = document.getElementById("concordance_table");

let POINT_SELECT_RADIUS = 5; //px, radius around point's (x,y) in which we consider the point clicked
let UNDERSTRAND_GAP = 5; //px, gap between an understrand and the crossing's center
let ARROW_SIZE = 5; //px, length & width of arrows drawn on strands to show orientation

let BAND_WIDTH = 10; //px, width of band we wind around everywhere.
let LOOP_WIDTH = 30; //px, width of starting loop for the band
let LOOP_HEIGHT = 20; //px, height of starting loop for the band

let R2_DIST_FROM_STRAND = 30; //px, the band goes to a point this far from the strand before doing a reidemeister 2 move under or over the strand
let R2_MIN_STRAND_LENGTH = 100;

let input = new State();
let entries = []; //will be filled with State objects as more ribbon concordances are generated


let s = input.strands; //for debugging convenience




/*notes:
BUG: adding a new strand that goes straight through an existing point, doesn't register as a crossing - currently throwing an error to deal with this

BUG/missing feature: big region won't be correctly detected if there are multiple components
-> probably deal with this in the band generation code

Iffy feature: ordered_indices in State object becomes wrong when strands are sorted - make better
-> probably store ordered_strands, not ordered_indices

TODO:
regions -
add to State class
method for getting draw point of a strand in a region
getRandomStrand() - implement the option "for_path", to do this will need a point in polygon utility function that works for concave polygons


Still getting intersections at endpoints that I don't want, despite the change to the newStrand() function in state.js
Probably has something to do about how new strands are recursively split up

Intersection at point happens when either a) draw a strand through a previous point, b) draw a strand, ending on a previous strand

Want to add ctrl+Z feature for entering a knot



*/