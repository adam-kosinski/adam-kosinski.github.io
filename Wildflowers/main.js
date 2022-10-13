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
        return;
    }
    if(e.target.id == "exit_settings"){
        if(selected_families.length == 0){
            alert("You must select some families");
            return;
        }
        nextPlant();
        document.getElementById("settings").style.display = "none";
        return;
    }
    if(e.target.id == "select_all"){
        selected_families = Object.keys(family_obs);
        nonselected_families = [];
        document.querySelectorAll(".family_choice").forEach(el => el.classList.add("selected"));
        return;
    }
    if(e.target.id == "select_none"){
        selected_families = [];
        nonselected_families = Object.keys(family_obs);
        document.querySelectorAll(".family_choice").forEach(el => el.classList.remove("selected"));
        return;
    }
    if(e.target.id == "select_diverse"){
        //first select none
        selected_families = [];
        nonselected_families = Object.keys(family_obs);
        document.querySelectorAll(".family_choice").forEach(el => el.classList.remove("selected"));

        //now select top 10 diverse families
        let sorted_diverse = Object.keys(family_obs).sort(NSpeciesComparator);
        for(let i=0; i<10; i++){
            let f = sorted_diverse[i];
            selected_families.push(f);
            nonselected_families.splice(nonselected_families.indexOf(f), 1);
            document.getElementById(f + "_choice").classList.add("selected");
        }
    }
    if(e.target.id == "sort_alphabetical"){
        sortFamilyChoices();
        return;
    }
    if(e.target.id == "sort_frequency"){
        sortFamilyChoices(function(a,b){
            return family_obs[b].length - family_obs[a].length;
        });
        return;
    }
    if(e.target.id == "sort_n_species"){
        sortFamilyChoices(NSpeciesComparator); //util.js
        return;
    }

    let enter_settings_match = searchParents(e.target, "id", "enter_settings");
    if(enter_settings_match){
        guessing = false;
        document.getElementById("settings").style.display = "block";
        return;
    }

    let family_choice_match = searchParents(e.target, "class", "family_choice");
    if(family_choice_match){
        let is_selected = family_choice_match.classList.toggle("selected");
        let family_name = family_choice_match.id.split("_")[0];
        
        if(is_selected){
            selected_families.push(family_name);
            nonselected_families.splice(non_selected_families.indexOf(family_name), 1);
        }
        else {
            selected_families.splice(selected_families.indexOf(family_name), 1);
            nonselected_families.push(family_name);
        }
        return;
    }
}

function handleMousemove(e){
    //Check if plant image is fully loaded. Can't do stuff relying on if on/off of image w/o it being loaded
    if(document.getElementById("plant_img").complete){
        let img_box = getImageBox(); //util.js
        let zoom_container = document.getElementById("zoom_img_container");
        let zoom_img = document.getElementById("zoom_img");

        if(mouseOverImage(e, img_box) && zoom_img.complete){ //util.js

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




// NON EVENT HANDLER FUNCTIONS ---------------------------------------------------------

function nextPlant(){

    //reset
    document.getElementById("answers").style.display = "none";
    document.getElementById("feedback").textContent = "";
    guessing = true;

    //new tuple
    let next_family;
    if(Math.random() < other_rate && nonselected_families.length > 0){
        next_family = nonselected_families[Math.floor(Math.random() * nonselected_families.length)];
    }
    else {
        if(selected_families.length == 0){
            console.error("Somehow selected_families is empty");
            return;
        }
        next_family = selected_families[Math.floor(Math.random() * selected_families.length)];
    }
    let tuples = family_obs[next_family];
    current_tuple = tuples[Math.floor(Math.random() * tuples.length)]; //global var in init.js

    
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




function checkAnswer(){
    let guess_input = document.getElementById("guess");
    let feedback = document.getElementById("feedback");

    let guess_string = guess_input.value.toLowerCase();
    let is_other = !selected_families.includes(current_tuple.taxon_family_name);

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

    //display answers
    guess_input.readOnly = true;
    guess_input.blur(); //to hide datalist options still hanging around annoyingly
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




function sortFamilyChoices(compare_func){
    let families = Object.keys(family_obs);

    if(!compare_func){
        families.sort();
    }
    else {
        families.sort(compare_func);
    }
    
    let grid = document.getElementById("family_choices_grid");
    for(let i=0; i<families.length; i++){
        grid.appendChild(document.getElementById(families[i] + "_choice"));
    }
}