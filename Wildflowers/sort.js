document.getElementById("sort_options").addEventListener("click", function(e){
    if(!e.target.className.includes("sort")) return;
    sortPreset(e.target.id);
});

function sortPreset(id) {
    //id is the id of the preset element, in family_choices_header
    //if an invalid HTML id is passed, this function will just remove preset highlighting instead of adding it

    //switch preset highlighting
    document.querySelectorAll(".sort").forEach(el => el.classList.remove("selected"));
    let element = document.querySelector("#" + id);
    if(element) element.classList.add("selected");

    if(id == "sort_n_species"){
        sortFamilyChoices(NSpeciesComparator);
    }
    else if(id == "sort_alphabetical"){
        sortFamilyChoices();
    }
    else if(id == "sort_frequency"){
        sortFamilyChoices(function(a,b){
            return family_obs[b].length - family_obs[a].length;
        });
    }
}

function sortFamilyChoices(compare_func) {
    let families = Object.keys(family_obs);

    compare_func ? families.sort(compare_func) : families.sort();

    //re-add to the grid in order
    let grid = document.getElementById("family_choices_grid");
    for (let i = 0; i < families.length; i++) {
        grid.appendChild(document.getElementById(families[i] + "_choice"));
    }
}

function NSpeciesComparator(a, b) { //used in select.js as well
    //takes family names a,b
    //returns -1, 0, or 1 appropriately
    return family_species[b].size - family_species[a].size;
}