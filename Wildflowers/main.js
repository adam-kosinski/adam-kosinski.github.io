// EVENT HANDLER FUNCTIONS ----------------------------------------------------------------

document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);
window.addEventListener("blur", handleWindowBlur)
document.addEventListener("keypress", handleKeypress);
document.addEventListener("click", handleClick);
document.addEventListener("mousemove", handleMousemove);

function handleWindowBlur(e){
    //clear the elpel page highlighting (b/c the Alt keyup event won't be processed)
    document.querySelectorAll(".elpel_page_exists").forEach(el => el.classList.remove("bold_border"));
    document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.remove("faded"));
}

function handleKeydown(e){
    if(e.key == "Alt"){
        e.preventDefault();
        document.querySelectorAll(".elpel_page_exists").forEach(el => el.classList.add("bold_border"));
        document.querySelectorAll(".no_elpel_page_exists").forEach(el => el.classList.add("faded"));
    }
}

function handleKeyup(e){
    if(e.key == "Alt"){
        document.querySelectorAll(".elpel_page_exists").forEach(el => el.classList.remove("bold_border"));
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
}

function handleClick(e){

    if(e.target.id == "next_plant"){
        nextPlant();
        return;
    }
    if(e.target.id == "elpel_img"){
        let elpel_zoom_img = document.getElementById("elpel_zoom_img");
        elpel_zoom_img.src = e.target.src;
        document.getElementById("elpel_zoom_img_container").style.display = "block";
        return;
    }
    if(searchParents(e.target, "id", "elpel_zoom_img_container")){
        document.getElementById("elpel_zoom_img_container").style.display = "none";
        return;
    }
    if(searchParents(e.target, "id", "exit_settings")){
        if(selected_families.length == 0){
            alert("You must select some families");
            return;
        }
        nextPlant();
        document.getElementById("settings").style.display = "none";
        return;
    }
    if(searchParents(e.target, "id", "enter_settings")){
        guessing = false;
        document.getElementById("settings").style.display = "block";
        document.getElementById("elpel_zoom_img_container").style.display = "none"; //in case it was open
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
        return;
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

    let family_choice_match = searchParents(e.target, "class", "family_choice");
    if(family_choice_match){
        let family_name = family_choice_match.id.split("_")[0];
        if(e.altKey){
            //redirect to the elpel webpage on this family - sneaky hidden feature
            if(family_data[family_name].id_notes.length > 0 || family_data[family_name].elpel_image_exists == "True"){
                window.open("https://www.wildflowers-and-weeds.com/Plant_Families/" + family_name + ".htm", "_blank");
            }
            else {
                alert("Elpel webpage doesn't seem to exist...");
            }
        }
        else {
            //normal behavior
            let is_selected = family_choice_match.classList.toggle("selected");
            if(is_selected){
                selected_families.push(family_name);
                nonselected_families.splice(nonselected_families.indexOf(family_name), 1);
            }
            else {
                selected_families.splice(selected_families.indexOf(family_name), 1);
                nonselected_families.push(family_name);
            }
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
    document.getElementById("elpel_zoom_img_container").style.display = "none";
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