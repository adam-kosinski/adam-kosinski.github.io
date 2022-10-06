//set globals

let obs, family_obs, family_data;
let current_tuple;
let guessing = false; //for handling pressing the enter key
let zoom_img_visible = false; //see mousemove event handler, so we don't need to ref the DOM every mousemove

function init(){
    //get observations data
    obs = Papa.parse(popular_observations_csv, {header: true}).data;

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

    //get families data and organize into a dictionary by family scientific names
    let families_parsed = Papa.parse(families_csv, {header: true}).data;
    family_data = {};
    for(let i=0; i<families_parsed.length; i++){
        let tuple = families_parsed[i];
        family_data[tuple.scientific_name] = tuple;
    }
    
    //initialize datalist, to suggest family names to user
    let datalist = document.getElementById("family_names");
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
}


init();