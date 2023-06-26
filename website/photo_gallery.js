let centerElement; //see getCenterElement()
let last_resize_time = -Infinity; //see scroll event handler
let open_container; //stores the .img_container whose content we're displaying in the zoom_img_container

window.addEventListener("load", function () {
    addImage(0);
    centerElement = document.querySelector(".img_container"); //start at 0 scroll, so just use the first image
});

function addImage(i) {
    let cols = document.querySelectorAll(".column");
    let n_cols = cols.length;

    //make image container for more reliable hover
    let div = document.createElement("div");
    div.classList.add("img_container");
    div.addEventListener("click", function(){
        openImage(div);
    });

    let img = document.createElement("img");
    img.src = "https://adam-kosinski.github.io/Photo-Gallery/images/small/" + filenames[i];
    img.dataset.filename = filenames[i];
    img.classList.add("grid_image");
    div.appendChild(img);

    let shortest;
    let min_height = Infinity;
    for (let j = 0; j < n_cols; j++) {
        let col_height = cols[j].getBoundingClientRect().height;
        if (col_height < min_height) {
            min_height = col_height;
            shortest = cols[j];
        }
    }

    shortest.appendChild(div);

    img.addEventListener("load", function () {
        if (i + 1 < filenames.length) addImage(i + 1);
        
        img.classList.add("loaded");
    });
}





//keep track of the most center element so that when we resize the window, we can scroll to it
document.getElementById("scroll_container").addEventListener("scroll", function(e){
    if(last_resize_time + 50 < performance.now()){ //hack to prevent scrollIntoView from triggering a scroll event and changing the center element
        centerElement = getCenterElement();
    }
});
function getCenterElement(){
    let window_center = 0.5*window.innerHeight;
    let best;
    let min_diff = Infinity;

    document.querySelectorAll(".img_container").forEach(div => {
        let rect = div.getBoundingClientRect();
        let center = rect.top + 0.5*rect.height;
        let diff = Math.abs(center - window_center);
        if(diff < min_diff){
            min_diff = diff;
            best = div;
        }
    });

    return best;
}
//when resize the window, scroll to center element
let old_window_width = window.innerWidth;
window.addEventListener("resize", function(){
    if (window.innerWidth == old_window_width) return; //iOS thing, sometimes resize triggered on scroll
    old_window_width = window.innerWidth;
    last_resize_time = performance.now();
    centerElement.scrollIntoView({block: "center"});
});



function openImage(container){
    open_container = container;

    let img = container.querySelector("img");
    let rect = img.getBoundingClientRect();
    let zoom_img_container = document.getElementById("zoom_img_container");

    let zoom_img = zoom_img_container.querySelector("img");
    zoom_img.src = img.src;
    zoom_img.style.top = rect.top + 0.5*rect.height + "px"; //css translates it -50%, -50% to make centering easier
    zoom_img.style.left = rect.left + 0.5*rect.width + "px";
    zoom_img.style.width = rect.width + "px";

    zoom_img.style.setProperty("--small-width", rect.width + "px");
    zoom_img.style.setProperty("--aspect-ratio", rect.width / rect.height);

    zoom_img_container.classList.add("trigger_open");
    img.style.visibility = "hidden";

    zoom_img.addEventListener("animationend", () => {
        // zoom_img.src = "https://adam-kosinski.github.io/Photo-Gallery/images/" + img.dataset.filename;
    }, {once: true});
}


document.addEventListener("keydown", function(e){
    if(e.key == "Escape" && getComputedStyle(document.getElementById("zoom_img_container")).display == "block"){
        closeImage();
    }
});
document.getElementById("zoom_img_container").addEventListener("click", function(e){
    closeImage();
});
function closeImage(){
    let zoom_img_container = document.getElementById("zoom_img_container");
    let zoom_img = zoom_img_container.querySelector("img");
    let img = open_container.querySelector("img");
    zoom_img.src = img.src;
    let rect = img.getBoundingClientRect();

    zoom_img.style.setProperty("--small-width", rect.width + "px");
    zoom_img.style.setProperty("--small-height", rect.height + "px");
    zoom_img.style.setProperty("--top-dest", rect.top + 0.5*rect.height + "px");
    zoom_img.style.setProperty("--left-dest", rect.left + 0.5*rect.width + "px");

    zoom_img_container.classList.add("trigger_close");


    zoom_img.addEventListener("animationend", () => {
        zoom_img_container.classList.remove("trigger_open", "trigger_close");
        img.style.visibility = "visible";
    }, {once: true});
}



//make mouse disappear after an inactivity timeout on the zoom image, for more flawless viewing
let t_last_mouseevent = 0;
let cursor_hide_timeout = 3000; //ms, matches YouTube's timeout hehe
let x_cursor_style = getComputedStyle(document.getElementById("zoom_img_container")).cursor;

document.addEventListener("mousemove", setLastMouseEvent);
document.addEventListener("click", setLastMouseEvent);

function setLastMouseEvent(){
    t_last_mouseevent = performance.now();
    let zoom_img_container = document.getElementById("zoom_img_container");

    //change cursor for zoom_img_container back to an x, unless we're in the middle of closing it
    if(zoom_img_container.classList.contains("trigger_close")){
        zoom_img_container.style.cursor = "auto";
    }
    else {
        zoom_img_container.style.cursor = x_cursor_style;
    }
}

//check every once in a while if we went over the timeout
setInterval(function(){
    if(performance.now() - t_last_mouseevent > cursor_hide_timeout){
        document.getElementById("zoom_img_container").style.cursor = "none";
    }
}, 500);