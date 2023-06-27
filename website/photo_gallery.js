let centerElement; //see getCenterElement()
let last_resize_time = -Infinity; //see scroll event handler
let open_container; //stores the .img_container whose content we're displaying in the zoom_img_container
let zoom_img = document.getElementById("zoom_img");
let zoom_img_hammer = new Hammer(zoom_img, { enable: false });


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
    div.addEventListener("click", function () {
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
document.getElementById("scroll_container").addEventListener("scroll", function (e) {
    if (last_resize_time + 50 < performance.now()) { //hack to prevent scrollIntoView from triggering a scroll event and changing the center element
        centerElement = getCenterElement();
    }
});
function getCenterElement() {
    let window_center = 0.5 * window.innerHeight;
    let best;
    let min_diff = Infinity;

    document.querySelectorAll(".img_container").forEach(div => {
        let rect = div.getBoundingClientRect();
        let center = rect.top + 0.5 * rect.height;
        let diff = Math.abs(center - window_center);
        if (diff < min_diff) {
            min_diff = diff;
            best = div;
        }
    });

    return best;
}
//when resize the window, scroll to center element
let old_window_width = window.innerWidth;
window.addEventListener("resize", function () {
    if (window.innerWidth == old_window_width) return; //iOS thing, sometimes resize triggered on scroll
    old_window_width = window.innerWidth;
    last_resize_time = performance.now();
    centerElement.scrollIntoView({ block: "center" });
});




function getZoomImageTransform(img) {
    let rect = img.getBoundingClientRect();
    let zoom_img = document.getElementById("zoom_img");

    //calculate translate
    let translateX = rect.x + rect.width / 2 - window.innerWidth / 2;
    let translateY = rect.y + rect.height / 2 - window.innerHeight / 2;

    //calculate scale change
    let padding = Number(getComputedStyle(zoom_img).padding.split("px")[0]);
    let max_width = window.innerWidth - 2 * padding;
    let max_height = window.innerHeight - 2 * padding;
    let scale = Math.max(rect.width / max_width, rect.height / max_height);

    return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}


function openImage(img_container) {
    //by default, position the zoom image in the open state
    //when opening, figure out transform to match the image, set that
    //add the trigger_open class to start a css animation, always to translate 0 and scale 0

    let zoom_img_container = document.getElementById("zoom_img_container");
    if (zoom_img_container.classList.contains("trigger_open") || zoom_img_container.classList.contains("trigger_close")) return;

    open_container = img_container;
    let img = img_container.querySelector("img");
    let zoom_img = document.getElementById("zoom_img");
    zoom_img.style.transform = getZoomImageTransform(img);
    zoom_img.src = img.src;

    zoom_img.addEventListener("load", () => {
        zoom_img_container.classList.add("trigger_open");
        img.style.visibility = "hidden";
    }, { once: true });

    zoom_img.addEventListener("animationend", () => {
        zoom_img.style.transform = "translate(0, 0)"; //fake the animation fill forwards, so we can mess with the transform property
        zoom_img_hammer.set({ enable: true });
        zoom_img_container.addEventListener("click", closeImage, { once: true });
        // zoom_img.src = "https://adam-kosinski.github.io/Photo-Gallery/images/" + img.dataset.filename;
    }, { once: true });
}


function closeImage() {
    let zoom_img_container = document.getElementById("zoom_img_container");
    let zoom_img = zoom_img_container.querySelector("img");
    let img = open_container.querySelector("img");

    zoom_img_hammer.set({ enable: false }); //no nonsense events being triggered
    zoom_img.style.setProperty("--close-transform", getZoomImageTransform(open_container)); //use the container since the image might still be shrunk from the hover
    zoom_img_container.classList.add("trigger_close");

    zoom_img.addEventListener("animationend", () => {
        zoom_img_container.classList.remove("trigger_open", "trigger_close");
        img.style.visibility = "visible";
    }, { once: true });
}


//hammer for interactive closing image! -------------

//TODO: bug where sometimes the image will get teleported to the top left corner when panning

// interactive panning
zoom_img_hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
let pan_origin;
zoom_img_hammer.on("panstart", e => {
    if (zoom_img.classList.contains("reset") || !e.additionalEvent || e.additionalEvent != "pandown") return;
    pan_origin = { x: e.clientX, y: e.clientY };
});
zoom_img_hammer.on("pan", e => {
    if (!pan_origin) return;
    zoom_img.style.transform = `translate(${e.deltaX}px, ${e.deltaY}px)`;
});

//when stop panning, return image to center
zoom_img_hammer.on("panend", e => {
    if (!pan_origin) return; //only trigger reset if was a valid pan
    pan_origin = undefined;

    zoom_img.classList.add("reset");
    zoom_img.addEventListener("animationend", () => {
        zoom_img.style.transform = "translate(0,0)";
        zoom_img.classList.remove("reset");
    }, { once: true });
});

//swipe down to close
zoom_img_hammer.get("swipe").set({ direction: Hammer.DIRECTION_VERTICAL });
zoom_img_hammer.on("swipedown", e => {
    if (!pan_origin) return;
    closeImage();
});


// end of hammer stuff ----------------------------

//escape key to close image
document.addEventListener("keydown", function (e) {
    if (e.key == "Escape" && document.getElementById("zoom_img_container").classList.contains("trigger_open")) {
        closeImage();
    }
});



//make mouse disappear after an inactivity timeout on the zoom image, for more flawless viewing
let t_last_mouseevent = 0;
let cursor_hide_timeout = 3000; //ms, matches YouTube's timeout hehe
let x_cursor_style = getComputedStyle(document.getElementById("zoom_img_container")).cursor;

document.addEventListener("mousemove", setLastMouseEvent);
document.addEventListener("click", setLastMouseEvent);

function setLastMouseEvent() {
    t_last_mouseevent = performance.now();
    let zoom_img_container = document.getElementById("zoom_img_container");

    //change cursor for zoom_img_container back to an x, unless we're in the middle of closing it
    if (zoom_img_container.classList.contains("trigger_close")) {
        zoom_img_container.style.cursor = "auto";
    }
    else {
        zoom_img_container.style.cursor = x_cursor_style;
    }
}

//check every once in a while if we went over the timeout
setInterval(function () {
    if (performance.now() - t_last_mouseevent > cursor_hide_timeout) {
        document.getElementById("zoom_img_container").style.cursor = "none";
    }
}, 500);