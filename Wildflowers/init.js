function clearData(){
    obs = [];
    family_obs = {};
    family_species = {};
    pages_to_fetch = [];
    document.getElementById("family_choices_grid").innerHTML = "";

    document.getElementById("fetch_observations").style.display = "block";
    document.getElementById("fetch_observations").textContent = "Fetch Images"; //reset to original text

    document.getElementById("all_images_fetched").style.display = "none";
}


function getFamilyData(){
    //get family data and organize into a dictionary by family scientific names
    let families_parsed = Papa.parse(families_csv, {header: true}).data;
    family_data = {};
    for(let i=0; i<families_parsed.length; i++){
        let tuple = families_parsed[i];
        family_data[tuple.scientific_name] = tuple;
    }
}


//can call init after the first time, giving a different csv
//it will re-initialize everything to use the new csv

function init(csv, obs_to_add=[]){

    //get observations data - either from csv, or from a list of observation tuples (used by the custom place functionality)
    if(csv !== undefined){
        obs = Papa.parse(csv, {header: true}).data;
    }
    obs = obs.concat(obs_to_add);

    //read family data if haven't before
    if(!family_data){
        getFamilyData();
    }

    //construct object organizing observations by family - object: {family1: [observations], etc.}
    family_obs = {};
    for(let i=0; i<obs.length; i++){
        let tuple = obs[i];

        let family = tuple.taxon_family_name;
        if(!family_obs.hasOwnProperty(family)){
            family_obs[family] = [];
        }
        family_obs[family].push(tuple);
    }

    //put species in each family into a set object, so we can count # species
    family_species = {};
    for(let family in family_obs){
        let pics = family_obs[family];
        let species_set = new Set();
        family_obs[family].forEach(tuple => species_set.add(tuple.scientific_name));
        family_species[family] = species_set;
    }
    
    //initialize datalist, to suggest family names to user
    let datalist = document.getElementById("family_names");
    datalist.innerHTML = "";

    for(let family in family_obs){
        let scientific_option = document.createElement("option");
        scientific_option.value = family;
        datalist.appendChild(scientific_option);

        let common_name = family_data[family].common_name;
        if(common_name.length > 0){
            let common_option = document.createElement("option");
            common_option.value = common_name;
            datalist.appendChild(common_option);
        }
    }
    //add the "Other" option for families not currently selected
    let other_option = document.createElement("option");
    other_option.value = "Other";
    datalist.appendChild(other_option);


    //add families to settings panel
    let family_choices_grid = document.getElementById("family_choices_grid");
    family_choices_grid.innerHTML = "";

    for(let family in family_obs){
        let div = document.createElement("div");
        div.id = family + "_choice";
        div.classList.add("family_choice");
        if(family_data[family].id_notes.length > 0 || family_data[family].elpel_image_exists == "True" || family in elpel_redirects){
            div.classList.add("elpel_page_exists");
        }
        else {
            div.classList.add("no_elpel_page_exists");
        }

        let img = document.createElement("img");
        img.src = family_data[family].image_url;
        div.appendChild(img);

        let p = document.createElement("p");
        p.innerHTML =
            "<span>" + family + "</span><br>" + family_data[family].common_name + "<br>" +
            " (" + family_species[family].size + " sp, " + family_obs[family].length + " pics)";
        div.appendChild(p);

        div.addEventListener("click", function(e){
            if(e.altKey){
                //redirect to the elpel webpage on this family - sneaky hidden feature
                if(family_data[family].id_notes.length > 0 || family_data[family].elpel_image_exists == "True"){
                    window.open("https://www.wildflowers-and-weeds.com/Plant_Families/" + family + ".htm", "_blank");
                    return;
                }
                else if(family in elpel_redirects){
                    window.open(elpel_redirects[family]);
                    return;
                }
                alert("Info webpage doesn't seem to exist for this family...");
                return;
            }
            //default click behavior
            toggleFamily(family); //select.js
        });

        family_choices_grid.appendChild(div);
    }

    //select families, trying to keep the same selections as before
    if(selected_families.size == 0){
        //update the family list then select the easy ones (default)
        selected_families = new Set([]);
        nonselected_families = new Set(Object.keys(family_obs));
        selectPreset("select_easy");
    }
    else {
        //Try to keep same selections as before

        selectPreset(null); //remove highlighting, we don't know if previous preset still holds
        
        let prev_selected = new Set(selected_families);
        selected_families = new Set([]);
        nonselected_families = new Set([]);
        for(let family in family_obs){
            prev_selected.has(family) ? select(family) : deselect(family); //select.js
        }
    }

    //sort families, try to keep same sort method as before
    let selected_sort = document.querySelector(".sort.selected");
    if(selected_sort){
        sortPreset(selected_sort.id);
    }
    else {
        sortPreset("sort_selected_first"); //default sort
    }

    //add family image credits
    let attributions = ["All images sourced from iNaturalist.<br>"];
    for(let family in family_obs){
        attributions.push("<b>" + family + "</b>: " + family_data[family].attribution);
    }
    attributions.sort();
    document.getElementById("family_image_credits_list").innerHTML = attributions.join("<br>");
}


init(datasets[document.getElementById("dataset_select").value]);