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