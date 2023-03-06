document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);
window.addEventListener("blur", handleWindowBlur)
document.addEventListener("keypress", handleKeypress);
document.addEventListener("click", handleClick);
document.addEventListener("mousemove", handleMousemove);
document.getElementById("place_search").addEventListener("input", updatePlaceSearchResults);
document.getElementById("dataset_select").addEventListener("change", function (e) {
    if (e.target.value != "custom") {
        init(datasets[e.target.value]);
    }
    else {
        console.log("selected custom");
        document.getElementById("custom_place_dialog").showModal();
    }
});

function handleWindowBlur(e) {
    //clear the elpel page highlighting (b/c the Alt keyup event won't be processed)
    document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.remove("faded"));
}

function handleKeydown(e) {
    if (e.key == "Alt") {
        e.preventDefault();
        document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.add("faded"));
    }
}

function handleKeyup(e) {
    if (e.key == "Alt") {
        document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.remove("faded"));
    }
}

function handleKeypress(e) {
    if (e.key == "Enter") {
        if (guessing) {
            checkAnswer();
        }
        else {
            nextPlant();
        }
    }
    else if (guessing) {
        document.getElementById("guess").focus(); //this inputs the key we just typed as well
    }
}

function handleClick(e) {
    if (document.getElementById("exit_settings").contains(e.target)) {
        if (selected_families.size == 0) {
            alert("You must select some families");
            return;
        }
        nextPlant();
        document.getElementById("settings").style.display = "none";
    }
    else if (document.getElementById("enter_settings").contains(e.target)) {
        guessing = false;
        document.getElementById("settings").style.display = "block";
        document.getElementById("elpel_zoom_img_container").style.display = "none"; //in case it was open
    }
    else if (e.target.id == "next_plant") {
        nextPlant();
    }
    else if (e.target.id == "elpel_img") {
        let elpel_zoom_img = document.getElementById("elpel_zoom_img");
        elpel_zoom_img.src = e.target.src;
        document.getElementById("elpel_zoom_img_container").style.display = "block";
    }
    else if (document.getElementById("elpel_zoom_img_container").contains(e.target)){
        document.getElementById("elpel_zoom_img_container").style.display = "none";
    }
    else if (e.target.id == "family_image_credit_link") {
        document.getElementById("family_image_credits").showModal();
    }
    else if (e.target.classList.contains("exit_dialog")) {
        e.target.parentElement.close();
    }
}

function handleMousemove(e) {
    //Image zoom on hover feature
    //Check if plant image is fully loaded. Can't do stuff relying on if on/off of image w/o it being loaded
    if (document.getElementById("plant_img").complete) {
        let zoom_container = document.getElementById("zoom_img_container");
        let zoom_img = document.getElementById("zoom_img");

        if (e.target.id == "plant_img" && zoom_img.complete) {

            if (!zoom_img_visible) {
                zoom_container.style.display = "block";
                zoom_img_visible = true;
            }

            let zoom_factor = zoom_img.clientWidth / e.target.clientWidth;
            let left = zoom_container.clientWidth / 2 - (e.offsetX * zoom_factor);
            let top = zoom_container.clientHeight / 2 - (e.offsetY * zoom_factor);
            left = Math.max(-zoom_img.clientWidth + zoom_container.clientWidth, Math.min(0, left));
            top = Math.max(-zoom_img.clientHeight + zoom_container.clientHeight, Math.min(0, top));
            zoom_img.style.left = left + "px";
            zoom_img.style.top = top + "px";
        }
        else if (zoom_img_visible) {
            zoom_container.style.display = "none";
            zoom_img_visible = false;
        }
    }
}

let last_search_time = -Infinity;
let timeout_id = undefined;
function updatePlaceSearchResults(e){
    //retrieve possible place names from iNaturalist, only do once per second at most
    //do this by checking time since last api call, and if not more than 1 sec, setting a timeout
    //whenever this function is called, cancel the timeout, since we have new data

    clearTimeout(timeout_id);

    let now = performance.now();
    let diff = now - last_search_time;
    if (diff < 1000){
        timeout_id = setTimeout(updatePlaceSearchResults, 1001-diff, e); //extra 1ms to be safe
    }
    else {
        last_search_time = now;

        fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${e.target.value}&order_by=area`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                //sort places by assigning scores = bounding box area / long-lat distance from user
                //bigger scores are ranked higher
                //i.e. want small distance and large bounding box area, but balanced out sort of
                data.results.sort((a,b) => {
                    let a_split = a.location.split(",");
                    let a_lat = Number(a_split[0]);
                    let a_long = Number(a_split[1]);
                    let a_dist = Math.hypot(user_location.latitude - a_lat, user_location.longitude - a_long);

                    let b_split = b.location.split(",");
                    let b_lat = Number(b_split[0]);
                    let b_long = Number(b_split[1]);
                    let b_dist = Math.hypot(user_location.latitude - b_lat, user_location.longitude - b_long);

                    return b.bbox_area/b_dist - a.bbox_area/a_dist;
                });

                //display results
                let search_results = document.getElementById("search_results");
                search_results.innerHTML = "";
                data.results.forEach(place => {
                    let li = document.createElement("li");
                    li.textContent = place.display_name;
                    search_results.appendChild(li);
                });
                //tell the user if no results were found
                document.getElementById("no_results_found").style.display = 
                    (data.results.length == 0 && e.target.value.length > 0 ? "block" : "none");
            })
    }
}