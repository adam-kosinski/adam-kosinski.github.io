document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);
window.addEventListener("blur", handleWindowBlur)
document.addEventListener("keypress", handleKeypress);
document.addEventListener("click", handleClick);
document.addEventListener("mousemove", handleMousemove);
document.getElementById("dataset_select").addEventListener("change", function (e) {
    init(datasets[e.target.value]);
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
    else if (e.target.id == "family_image_credits_exit") {
        document.getElementById("family_image_credits").close();
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