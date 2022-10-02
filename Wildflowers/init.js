//set globals

let obs, family_obs;
let current_tuple;
let still_guessing = true; //for handling pressing the enter key
let zoom_img_visible = false; //see mousemove event handler, so we don't need to ref the DOM every mousemove

function init(){
    obs = Papa.parse(popular_observations_csv, {header: true}).data;

    //construct data structure organizing by family
    //object: {family1: [observations], family2: [observations]}
    
    family_obs = {};
    
    for(let i=0; i<obs.length; i++){
        let tuple = obs[i];
        let family = tuple.taxon_family_name;
        if(!family_obs.hasOwnProperty(family)){
            family_obs[family] = [];
        }
        family_obs[family].push(tuple);
    }
    
    //initialize datalist, to suggest family names to user
    let datalist = document.getElementById("family_names");
    for(family in family_obs){
        let option = document.createElement("option");
        option.value = family;
        datalist.appendChild(option);
    }
    
    //show first plant
    nextPlant();
}


init();