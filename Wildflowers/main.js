// EVENT HANDLER FUNCTIONS ----------------------------------------------------------------

document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);
window.addEventListener("blur", handleWindowBlur)
document.addEventListener("keypress", handleKeypress);
document.addEventListener("click", handleClick);
document.addEventListener("mousemove", handleMousemove);
document.getElementById("dataset_select").addEventListener("change", function(e){
    init(datasets[e.target.value]);
});

function handleWindowBlur(e){
    //clear the elpel page highlighting (b/c the Alt keyup event won't be processed)
    document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.remove("faded"));
}

function handleKeydown(e){
    if(e.key == "Alt"){
        e.preventDefault();
        document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.add("faded"));
    }
}

function handleKeyup(e){
    if(e.key == "Alt"){
        document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.remove("faded"));
    }
}

function handleKeypress(e){
    if(e.key == "Enter"){
        if(guessing){
            checkAnswer();
        }
        else {
            nextPlant();
        }
    }
    else if (guessing){
        document.getElementById("guess").focus(); //this inputs the key we just typed as well
    }
}

//click event handling

//start button
document.getElementById("exit_settings").addEventListener("click", function(e){
    if(selected_families.size == 0){
        alert("You must select some families");
        return;
    }
    nextPlant();
    document.getElementById("settings").style.display = "none";
});

//return to settings button
document.getElementById("enter_settings").addEventListener("click", function(){
    guessing = false;
    document.getElementById("settings").style.display = "block";
    document.getElementById("elpel_zoom_img_container").style.display = "none"; //in case it was open
});

//elpel zoom image
document.getElementById("elpel_img").addEventListener("click", function(e){
    let elpel_zoom_img = document.getElementById("elpel_zoom_img");
    elpel_zoom_img.src = e.target.src;
    document.getElementById("elpel_zoom_img_container").style.display = "block";
});
document.getElementById("elpel_zoom_img_container").addEventListener("click", function(e){
    document.getElementById("elpel_zoom_img_container").style.display = "none";
});


function handleClick(e){

    if(e.target.id == "next_plant"){
        nextPlant();
    }
    else if(e.target.id == "family_image_credit_link"){
        document.getElementById("family_image_credits").showModal();
    }
    else if(e.target.id == "family_image_credits_exit"){
        document.getElementById("family_image_credits").close();
    }
    if(e.target.id == "sort_alphabetical"){
        sortFamilyChoices(); //util.js
        return;
    }
    if(e.target.id == "sort_frequency"){
        sortFamilyChoices(function(a,b){ //util.js
            return family_obs[b].length - family_obs[a].length;
        });
        return;
    }
    if(e.target.id == "sort_n_species"){
        sortFamilyChoices(NSpeciesComparator); //util.js
        return;
    }
}

function handleMousemove(e){
    //Image zoom on hover feature
    //Check if plant image is fully loaded. Can't do stuff relying on if on/off of image w/o it being loaded
    if(document.getElementById("plant_img").complete){
        let zoom_container = document.getElementById("zoom_img_container");
        let zoom_img = document.getElementById("zoom_img");

        if(e.target.id == "plant_img" && zoom_img.complete){

            if(!zoom_img_visible){
                zoom_container.style.display = "block";
                zoom_img_visible = true;
            }

            let zoom_factor = zoom_img.clientWidth / e.target.clientWidth;
            let left = zoom_container.clientWidth/2 - (e.offsetX * zoom_factor);
            let top = zoom_container.clientHeight/2 - (e.offsetY * zoom_factor);
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





// NON EVENT HANDLER FUNCTIONS ---------------------------------------------------------

function nextPlant(){

    //reset
    document.getElementById("answers").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("elpel_zoom_img_container").style.display = "none";
    guessing = true;

    //new tuple
    let next_family;
    if(Math.random() < other_rate && nonselected_families.size > 0){
        next_family = Array.from(nonselected_families)[Math.floor(Math.random() * nonselected_families.size)];
    }
    else {
        if(selected_families.size == 0){
            console.error("Somehow selected_families is empty");
            return;
        }
        next_family = Array.from(selected_families)[Math.floor(Math.random() * selected_families.size)];
    }
    let tuples = family_obs[next_family];
    current_tuple = tuples[Math.floor(Math.random() * tuples.length)]; //global var in init.js

    
    //update plant image
    document.getElementById("plant_img").src = current_tuple.image_url;
    document.getElementById("zoom_img").src = current_tuple.image_url.replace("medium", "original");

    //update image credit
    let author_name = current_tuple.user_name;
    document.getElementById("img_author").textContent = author_name.length > 0 ? "© " + author_name + ". ": "";
    
    document.getElementById("license_description").textContent = current_tuple.license == "CC0" ? "No rights reserved" : "Some rights reserved";
    let license_link = document.getElementById("license_link");
    license_link.textContent = current_tuple.license;
    license_link.href = license_links[current_tuple.license]; //global config var
    
    let inat_link = document.getElementById("inat_url");
    let url = "https://inaturalist.org/observations/" + current_tuple.id;
    inat_link.textContent = url;
    inat_link.href= url;

    //reset the input
    let guess_input = document.getElementById("guess");
    guess_input.value = "";
    guess_input.readOnly = false;
}




function checkAnswer(){
    let guess_input = document.getElementById("guess");
    let feedback = document.getElementById("feedback");

    let guess_string = guess_input.value.toLowerCase();
    let is_other = !selected_families.has(current_tuple.taxon_family_name);

    if(
        guess_string == current_tuple.taxon_family_name.toLowerCase() ||
        guess_string == family_data[current_tuple.taxon_family_name].common_name.toLowerCase() ||
        (is_other && guess_string == "other")
    ){
        feedback.className = "correct";
        feedback.textContent = "Correct!";
    }
    else {
        feedback.className = "incorrect";
        feedback.textContent = "Nope, correct: " + (is_other ? "Other" : current_tuple.taxon_family_name);
    }

    guessing = false;

    //prepare answers to display

    guess_input.readOnly = true;
    guess_input.blur(); //to hide datalist options still hanging around annoyingly
    document.getElementById("common_name").textContent = capitalize(current_tuple.common_name);
    document.getElementById("scientific_name").textContent = current_tuple.scientific_name;
    
    let f_sci = current_tuple.taxon_family_name;
    let f_com = family_data[f_sci].common_name;
    document.getElementById("family_name").textContent = f_sci + (f_com.length > 0 ? " (" + f_com + ")" : "");
    
    //elpel keywords
    let keywords = document.getElementById("elpel_keywords");
    if(family_data[f_sci].id_notes.length > 0){
        keywords.textContent = family_data[f_sci].id_notes;
        keywords.style.display = "inline";
    }
    else {
        keywords.style.display = "none";
    }
    
    //more info link
    let more_info = document.getElementById("more_info_link");
    if(family_data[f_sci].id_notes.length > 0 || family_data[f_sci].elpel_image_exists == "True"){
        more_info.href = "https://www.wildflowers-and-weeds.com/Plant_Families/" + f_sci + ".htm"
        more_info.style.display = "inline";
    }
    else {
        more_info.style.display = "none";
    }

    //elpel image
    let elpel_img = document.getElementById("elpel_img");
    if(family_data[f_sci].elpel_image_exists == "True"){
        elpel_img.src = "https://www.wildflowers-and-weeds.com/Plant_Families/" + f_sci + "_pics/" + f_sci + ".jpg";
        elpel_img.style.display = "block";
    }
    else {
        elpel_img.style.display = "none";
    }

    document.getElementById("class_name").textContent = family_data[f_sci].class;
    
    //display answers
    document.getElementById("answers").style.display = "block";

    //clear zoom image briefly, in case the user submitted while it was open, so they
    //can see that the result was processed
    document.getElementById("zoom_img_container").style.display = "none";
    zoom_img_visible = false;
}