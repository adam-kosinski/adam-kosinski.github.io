// EVENT HANDLER FUNCTIONS ----------------------------------------------------------------

document.addEventListener("keypress", handleKeypress);
document.addEventListener("click", handleClick);
document.addEventListener("mousemove", handleMousemove);

function handleKeypress(e){
    if(e.key == "Enter"){
        if(guessing){
            checkAnswer();
        }
        else {
            nextPlant();
        }
    }
}

function handleClick(e){
    if(e.target.id == "next_plant"){
        nextPlant();
    }
    else if(e.target.id == "exit_settings"){
        nextPlant();
        document.getElementById("settings").style.display = "none";
    }
    else if(e.target.id == "enter_settings" || e.target.parentElement.id == "enter_settings"){
        guessing = false;
        document.getElementById("settings").style.display = "block";
    }
}

function handleMousemove(e){
    //Check if plant image is fully loaded. Can't do stuff relying on if on/off of image w/o it being loaded
    if(document.getElementById("plant_img").complete){
        let img_box = getImageBox();
        let zoom_container = document.getElementById("zoom_img_container");
        let zoom_img = document.getElementById("zoom_img");

        if(mouseOverImage(e, img_box) && zoom_img.complete){

            if(!zoom_img_visible){
                zoom_container.style.display = "block";
                zoom_img_visible = true;
            }

            let offset_x = e.offsetX - img_box.x;
            let offset_y = e.offsetY - img_box.y;

            let zoom_factor = zoom_img.clientWidth / img_box.width;
            let left = zoom_container.clientWidth/2 - (offset_x * zoom_factor);
            let top = zoom_container.clientHeight/2 - (offset_y * zoom_factor);
            left = Math.max(-zoom_img.clientWidth + zoom_container.clientWidth , Math.min(0, left));
            top = Math.max(-zoom_img.clientHeight + zoom_container.clientHeight , Math.min(0, top));
            zoom_img.style.left = left + "px";
            zoom_img.style.top = top + "px";
        }
        else if(zoom_img_visible){
            zoom_container.style.display = "none";
            zoom_img_visible = false;
        }
    }

}

function mouseOverImage(e, img_box){
    //takes the e of a mousemove event
    //check if the mouse is actually over the plant image as displayed
    //since the object-fit: contain; css makes the image display smaller than its actual width and height

    if(e.target.id != "plant_img" || !e.target.complete) return false; //complete checks if img is loaded

    if(e.offsetX >= img_box.x && e.offsetX <= (img_box.x + img_box.width) &&
        e.offsetY >= img_box.y && e.offsetY <= (img_box.y + img_box.height)){
        return true;
    }
    return false;
}





// NON EVENT HANDLER FUNCTIONS ---------------------------------------------------------

function checkAnswer(){
    let guess_input = document.getElementById("guess");
    let feedback = document.getElementById("feedback");

    let guess_string = guess_input.value.toLowerCase();

    if(guess_string.length > 0 && (
        guess_string == current_tuple.taxon_family_name.toLowerCase() ||
        guess_string == family_data[current_tuple.taxon_family_name].common_name.toLowerCase()
    )){
        feedback.className = "correct";
        feedback.textContent = "Correct!";
    }
    else {
        feedback.className = "incorrect";
        feedback.textContent = "Nope, correct: " + current_tuple.taxon_family_name;
    }

    guessing = false;

    //display answers
    guess_input.readOnly = true;
    document.getElementById("common_name").textContent = capitalize(current_tuple.common_name);
    document.getElementById("scientific_name").textContent = current_tuple.scientific_name;
    
    let family_scientific = current_tuple.taxon_family_name;
    let family_common = family_data[family_scientific].common_name;
    document.getElementById("family_name").textContent = family_scientific + (family_common.length > 0 ? " (" + family_common + ")" : "");
    
    document.getElementById("elpel_keywords").textContent = family_data[family_scientific].id_notes;
    let more_info = document.getElementById("more_info_link");
    if(family_data[family_scientific].id_notes.length > 0 || family_data[family_scientific].elpel_image_exists == 'True'){
        more_info.href = "https://www.wildflowers-and-weeds.com/Plant_Families/" + family_scientific + ".htm"
        more_info.style.display = "inline";
    }
    else {
        more_info.style.display = "none";
    }
    document.getElementById("class_name").textContent = family_data[family_scientific].class;
    
    
    document.getElementById("answers").style.display = "block";

    //clear zoom image briefly, in case the user submitted while it was open, so they
    //can see that the result was processed
    document.getElementById("zoom_img_container").style.display = "none";
    zoom_img_visible = false;
}


function nextPlant(){

    //reset
    document.getElementById("answers").style.display = "none";
    document.getElementById("feedback").textContent = "";
    guessing = true;

    //new tuple
    current_tuple = obs[Math.floor(Math.random() * obs.length)]; //global var in init.js

    //update plant image
    document.getElementById("plant_img").src = current_tuple.image_url;
    document.getElementById("zoom_img").src = current_tuple.image_url.replace("medium", "original");

    //update image credit
    let author_name = current_tuple.user_name;
    document.getElementById("img_author").textContent = author_name.length > 0 ? author_name + ". ": "";
    let inat_link = document.getElementById("inat_url");
    let url = "https://inaturalist.org/observations/" + current_tuple.id;
    inat_link.textContent = url;
    inat_link.href= url;

    //reset and focus the input
    let guess_input = document.getElementById("guess");
    guess_input.value = "";
    guess_input.readOnly = false;
    guess_input.focus();
}


function capitalize(str){
    return str.replace(/^\w|(?<=\s)\w|-\w/g, function(char){
        return char.toUpperCase();
    });
}


function getImageBox(){
    //returns {x:_, y:_, width:_, height:_} of the plant display image
    //needed because the display position and size doesn't match the image position and size, due to the object-fit: contain; css

    let img = document.getElementById("plant_img");
    let out = {};

    let img_aspect_ratio = img.naturalWidth / img.naturalHeight;
    let container_aspect_ratio = img.clientWidth / img.clientHeight;

    if(img_aspect_ratio > container_aspect_ratio){
        //then image limited by width
        out.width = img.clientWidth;
        out.height = img.clientWidth / img_aspect_ratio;
    }
    else {
        //then image limited by height
        out.height = img.clientHeight;
        out.width = img.clientHeight * img_aspect_ratio;
    }

    out.x = (img.clientWidth - out.width) / 2;
    out.y = (img.clientHeight - out.height) / 2;

    return out;
}
