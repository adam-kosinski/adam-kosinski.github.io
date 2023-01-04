function capitalize(str){
    return str.replace(/^\w|(?<=\s)\w|-\w/g, function(char){
        return char.toUpperCase();
    });
}


function searchParents(child, attr, value){
    //attr can be "id" or "class"
    //searches parents of the child element looking for a parent with the id/class value
    //returns matching element if found, else null

    if(attr != "id" && attr != "class"){
        console.error("Incorrect attr argument to searchParents function: " + attr);
        return;
    }

    let current = child;
    while(current.tagName != "HTML"){
        if(attr == "id" && current.id == value ||
            attr == "class" && current.classList.contains(value)
        ){
            return current;
        }
        current = current.parentElement;
    }
    return null;
}

function sortFamilyChoices(compare_func){
    let families = Object.keys(family_obs);

    if(!compare_func){
        families.sort();
    }
    else {
        families.sort(compare_func);
    }
    
    //re-add to the grid in order
    let grid = document.getElementById("family_choices_grid");
    for(let i=0; i<families.length; i++){
        grid.appendChild(document.getElementById(families[i] + "_choice"));
    }
}


function NSpeciesComparator(a,b){
    //takes family names a,b
    //returns -1, 0, or 1 appropriately
    return family_species[b].size - family_species[a].size;
}


function selectNone(){
    selected_families = [];
    nonselected_families = Object.keys(family_obs);
    document.querySelectorAll(".family_choice").forEach(el => el.classList.remove("selected"));
}


function selectEasy(){
    selectNone();

    for(let f in family_obs){
        if(easy_families.has(f)){
            selected_families.push(f);
            document.getElementById(f + "_choice").classList.add("selected");
            nonselected_families.splice(nonselected_families.indexOf(f), 1);
        }
    }
}


function selectTopNDiverse(n){
    selectNone();

    //now select top 10 diverse families
    let sorted_diverse = Object.keys(family_obs).sort(NSpeciesComparator);
    for(let i=0; i<n; i++){
        let f = sorted_diverse[i];
        selected_families.push(f);
        nonselected_families.splice(nonselected_families.indexOf(f), 1);
        document.getElementById(f + "_choice").classList.add("selected");
    }
}


//selections based on the global custom sets object (really just for Adam's use)
function selectCustom(set_name){
    selectNone();

    //check if this custom set exists
    if(!custom_sets.hasOwnProperty(set_name)){
        console.warn("Can't find this custom set. Set names:");
        for(let name in custom_sets){
            console.log(name);
        }
        return;
    }

    let set = custom_sets[set_name];

    for(let i=0; i<set.length; i++){
        let family = set[i];
        if(family_obs.hasOwnProperty(family)){
            selected_families.push(family);
            nonselected_families.splice(nonselected_families.indexOf(family), 1);
            document.getElementById(family + "_choice").classList.add("selected");
        }
    }
}