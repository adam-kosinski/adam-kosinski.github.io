//can call init after the first time, giving a different csv
//it will re-initialize everything to use the new csv

function init(csv){
    //get observations data
    obs = Papa.parse(csv, {header: true}).data;

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

    //get family data and organize into a dictionary by family scientific names
    let families_parsed = Papa.parse(families_csv, {header: true}).data;
    family_data = {};
    for(let i=0; i<families_parsed.length; i++){
        let tuple = families_parsed[i];
        family_data[tuple.scientific_name] = tuple;
    }
    
    //initialize datalist, to suggest family names to user
    let datalist = document.getElementById("family_names");
    datalist.innerHTML = "";

    for(family in family_obs){
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

    for(family in family_obs){
        let div = document.createElement("div");
        div.id = family + "_choice";
        div.className = "family_choice selected"; //by default all are selected
        if(family_data[family].id_notes.length > 0 || family_data[family].elpel_image_exists == "True"){
            div.classList.add("elpel_page_exists");
        }
        else {
            div.classList.add("no_elpel_page_exists");
        }

        selected_families.push(family);

        let img = document.createElement("img");
        img.src = family_data[family].image_url;
        div.appendChild(img);

        let p = document.createElement("p");
        p.innerHTML = "<span>" + family + "</span><br>" + family_data[family].common_name + " (" + family_obs[family].length + ")";
        div.appendChild(p);

        family_choices_grid.appendChild(div);
    }

    sortFamilyChoices();
}


init(datasets[document.getElementById("dataset_select").value]);