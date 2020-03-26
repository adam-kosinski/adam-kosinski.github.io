let input_canvas = document.getElementById("input");
let input_button = document.getElementById("input_button");
let generate_concordance_button = document.getElementById("generate_concordance");

let display_canvas = document.getElementById("display");
let concordance_table = document.getElementById("concordance_table");

let original_PD_display; //reference to the td for displaying the original knot's PD

let POINT_SELECT_RADIUS = 5; //px, radius around point's (x,y) in which we consider the point clicked
let UNDERSTRAND_GAP = 5; //px, gap between an understrand and the crossing's center
let ARROW_SIZE = 5; //px, length & width of arrows drawn on strands to show orientation

let BAND_WIDTH = 10; //px, width of band we wind around everywhere.
let LOOP_WIDTH = 30; //px, width of starting loop for the band
let LOOP_HEIGHT = 20; //px, width of starting loop for the band

let input = new State();
let s = input.strands; //for debugging convenience


let entries = []; //will be filled with State objects as more ribbon concordances are generated


/*notes:
BUG: adding a new strand that goes straight through an existing point, doesn't register as a crossing

Still getting intersections at endpoints that I don't want, despite the change to the newStrand() function in state.js
Probably has something to do about how new strands are recursively split up

Intersection at point happens when either a) draw a strand through a previous point, b) draw a strand, ending on a previous strand

Want to add ctrl+Z feature for entering a knot



*/