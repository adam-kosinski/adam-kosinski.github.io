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
    else if(id == "sort_selected_first"){
        sortSelected();
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

function sortSelected(){
    sortFamilyChoices(function(a,b){
        let compare = selected_families.has(b) - selected_families.has(a);
        if (compare == 0) {
            //if same selected status, sort by n species, so that more common families show up first
            compare = NSpeciesComparator(a,b);
        }
        return compare;
    });
}

function updateSortSelected(from_click=false){
    //function is called when we select/deselect, need to update order if was sorted selected-first
    //from_click - if selected by clicking, remove sort highlighting and don't sort (so the family you just clicked doesn't jump away)
    let selected_elem = document.querySelector("#sort_options .selected")
    if(selected_elem && selected_elem.id == "sort_selected_first"){
        from_click ? sortPreset(null) : sortSelected();
    }
}