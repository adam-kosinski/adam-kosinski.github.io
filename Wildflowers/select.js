let presets = {
    //key is the HTML id of the element you click
    "select_easy": ["Asteraceae", "Poaceae", "Liliaceae", "Lamiaceae", "Brassicaceae", "Apiaceae", "Fabaceae", "Rosaceae"],
    "select_medium": ["Asteraceae", "Boraginaceae", "Cactaceae", "Typhaceae", "Onagraceae", "Scrophulariaceae", "Geraniaceae", "Grossulariaceae", "Cucurbitaceae", "Vitaceae", "Poaceae", "Ericaceae", "Iridaceae", "Liliaceae", "Malvaceae", "Lamiaceae", "Brassicaceae", "Solanaceae", "Orchidaceae", "Arecaceae", "Apiaceae", "Fabaceae", "Caryophyllaceae", "Rosaceae", "Saxifragaceae", "Urticaceae", "Violaceae", "Salicaceae"],
    "select_five_united_petals": ["Apocynaceae", "Boraginaceae", "Campanulaceae", "Caprifoliaceae", "Convolvulaceae", "Cucurbitaceae", "Ericaceae", "Gentianaceae", "Menyanthaceae", "Oleaceae", "Phrymaceae", "Polemoniaceae", "Primulaceae", "Rubiaceae", "Scrophulariaceae", "Solanaceae", "Verbenaceae", "Viburnaceae", "Vitaceae"],
    "select_lily_like": ["Liliaceae", "Melanthiaceae", "Colchicaceae", "Amaryllidaceae", "Asparagaceae", "Asphodelaceae", "Pontederiaceae", "Tofieldiaceae"],
    "select_four_petals": ["Brassicaceae", "Campanulaceae", "Cleomaceae", "Cornaceae", "Crassulaceae", "Ericaceae", "Gentianaceae", "Grossulariaceae", "Haloragaceae", "Hamamelidaceae", "Hydrangeaceae", "Hypericaceae", "Loasaceae", "Lythraceae", "Montiaceae", "Oleaceae", "Onagraceae", "Papaveraceae", "Plantaginaceae", "Polemoniaceae", "Portulacaceae", "Primulaceae", "Ranunculaceae", "Rhamnaceae", "Rosaceae", "Rubiaceae", "Sapindaceae", "Vitaceae"],
    "adam": ['Asteraceae', 'Lamiaceae', 'Fabaceae', 'Scrophulariaceae', 'Apiaceae', 'Geraniaceae', 'Rosaceae', 'Ericaceae', 'Orchidaceae', 'Brassicaceae', 'Boraginaceae', 'Saxifragaceae', 'Plantaginaceae', 'Convolvulaceae', 'Rubiaceae']
}


//basic select functions

function select(family, from_click=false) {
    selected_families.add(family);
    nonselected_families.delete(family);
    document.getElementById(family + "_choice").classList.add("selected");
    updateSortSelected(from_click); //since sort order might not be correct anymore
}
function deselect(family, from_click=false) {
    selected_families.delete(family);
    nonselected_families.add(family);
    document.getElementById(family + "_choice").classList.remove("selected");
    updateSortSelected(from_click); //since sort order might not be correct anymore
}
function toggleFamily(family) {
    //function called whenever you click on a family choice in the settings grid, see init.js
    let was_selected = document.getElementById(family + "_choice").classList.contains("selected");
    was_selected ? deselect(family, true) : select(family, true);  //this was triggered by a click, so from_click = true
    //custom selection now, so remove highlighted item in the selection header
    selectPreset(null);
}

//preset selection

document.getElementById("select_options").addEventListener("click", function(e){
    if(!e.target.className.includes("select")) return;
    selectPreset(e.target.id);
});

function selectPreset(id){
    //id is the id of the preset element, in family_choices_header
    //if an invalid HTML id is passed, this function will just remove preset highlighting instead of adding it

    //switch preset highlighting
    document.querySelectorAll(".select").forEach(el => el.classList.remove("selected"));
    let element = document.querySelector("#" + id);
    if(element) element.classList.add("selected");

    if(id == "select_all"){
        nonselected_families.forEach((f) => {select(f)});
    }
    else if(id == "select_none"){
        selected_families.forEach((f) => {deselect(f)});
    }
    else if(id == "select_diverse"){
        //select top 10 families with the most species
        let sorted_diverse = Object.keys(family_obs).sort(NSpeciesComparator); //sort.js
        for(let i=0; i<sorted_diverse.length; i++){
            i < 10 ? select(sorted_diverse[i]) : deselect(sorted_diverse[i]);
        }
    }
    else if(id == "select_monocots"){
        for(let f in family_obs){
            family_data[f].class == "Monocots" ? select(f) : deselect(f);
        }
    }
    else if(id in presets){
        for(let f in family_obs){
            presets[id].includes(f) ? select(f) : deselect(f);
        }
    }
}