function capitalize(str) {
    return str.replace(/^\w|(?<=\s)\w|-\w/g, function (char) {
        return char.toUpperCase();
    });
}

function nextPlant() {

    //reset
    document.getElementById("answers").style.display = "none";
    document.getElementById("feedback").textContent = "";
    document.getElementById("elpel_zoom_img_container").style.display = "none";
    guessing = true;

    //get next family
    let next_family;
    if (Math.random() < other_rate && nonselected_families.size > 0) {
        next_family = Array.from(nonselected_families)[Math.floor(Math.random() * nonselected_families.size)];
    }
    else {
        if (selected_families.size == 0) {
            console.error("Somehow selected_families is empty");
            return;
        }
        next_family = Array.from(selected_families)[Math.floor(Math.random() * selected_families.size)];
    }

    //get next tuple
    let tuples = family_obs[next_family];
    current_tuple = tuples[family_indices[next_family]]; //current_tuple is a global var in init.js
    
    //increment next photo index for this family
    family_indices[next_family]++;
    if(family_indices[next_family] >= family_obs[next_family].length){
        //loop back around and use a different shuffling
        family_indices[next_family] = 0;
        shuffleFamily(next_family);
    }

    //update plant image
    document.getElementById("plant_img").src = current_tuple.image_url;
    document.getElementById("zoom_img").src = current_tuple.image_url.replace("medium", "original");

    //update image credit
    let author_name = current_tuple.user_name;
    document.getElementById("img_author").textContent = author_name.length > 0 ? "© " + author_name + ". " : "";

    document.getElementById("license_description").textContent = current_tuple.license == "CC0" ? "No rights reserved" : "Some rights reserved";
    let license_link = document.getElementById("license_link");
    license_link.textContent = current_tuple.license;
    license_link.href = license_links[current_tuple.license]; //global config var

    let inat_link = document.getElementById("inat_url");
    let url = "https://inaturalist.org/observations/" + current_tuple.id;
    inat_link.textContent = url;
    inat_link.href = url;

    //reset the input
    let guess_input = document.getElementById("guess");
    guess_input.value = "";
    guess_input.readOnly = false;
}




function checkAnswer() {
    let guess_input = document.getElementById("guess");
    let feedback = document.getElementById("feedback");

    let guess_string = guess_input.value.toLowerCase();
    let is_other = !selected_families.has(current_tuple.taxon_family_name);
    let family_name = current_tuple.taxon_family_name.toLowerCase();
    let common_name = family_data[current_tuple.taxon_family_name].common_name.toLowerCase();

    if (
        guess_string == family_name ||
        (common_name.length > 0 && guess_string == common_name) ||
        (is_other && guess_string == "other")
    ) {
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
    if (family_data[f_sci].id_notes.length > 0) {
        keywords.textContent = family_data[f_sci].id_notes;
        keywords.style.display = "inline";
    }
    else {
        keywords.style.display = "none";
    }

    //more info link
    let more_info = document.getElementById("more_info_link");
    if (family_data[f_sci].id_notes.length > 0 || family_data[f_sci].elpel_image_exists == "True") {
        more_info.href = "https://www.wildflowers-and-weeds.com/Plant_Families/" + f_sci + ".htm"
        more_info.style.display = "inline";
    }
    else if(f_sci in elpel_redirects){
        more_info.href = elpel_redirects[f_sci];
        more_info.style.display = "inline";
    }
    else {
        more_info.style.display = "none";
    }

    //elpel image
    let elpel_img = document.getElementById("elpel_img");
    if (family_data[f_sci].elpel_image_exists == "True") {
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