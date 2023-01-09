let presets = {
    //key is the HTML id of the element you click
    "select_easy": [],
    "select_medium": ["Asteraceae", "Boraginaceae", "Cactaceae", "Typhaceae", "Onagraceae", "Scrophulariaceae", "Geraniaceae", "Grossulariaceae", "Cucurbitaceae", "Vitaceae", "Poaceae", "Ericaceae", "Iridaceae", "Liliaceae", "Malvaceae", "Lamiaceae", "Brassicaceae", "Solanaceae", "Orchidaceae", "Arecaceae", "Apiaceae", "Fabaceae", "Caryophyllaceae", "Rosaceae", "Saxifragaceae", "Urticaceae", "Violaceae", "Salicaceae"],
    "select_five_united_petals": ["Apocynaceae", "Boraginaceae", "Campanulaceae", "Cucurbitaceae", "Ericaceae", "Gentianaceae", "Scrophulariaceae", "Solanaceae", "Verbenaceae", "Vitaceae"],
    "select_lily_like": ["Liliaceae", "Melanthiaceae", "Colchiaceae", "Amaryllidaceae", "Asparagaceae", "Asphodelaceae", "Pontederiaceae"],
    "adam": ['Asteraceae', 'Lamiaceae', 'Fabaceae', 'Scrophulariaceae', 'Apiaceae', 'Geraniaceae', 'Rosaceae', 'Ericaceae', 'Orchidaceae', 'Brassicaceae', 'Boraginaceae', 'Saxifragaceae', 'Plantaginaceae', 'Convolvulaceae', 'Rubiaceae']
}

//basic select functions

function select(family) {
    selected_families.add(family);
    nonselected_families.delete(family);
    document.getElementById(family + "_choice").classList.add("selected");
}
function deselect(family) {
    selected_families.delete(family);
    nonselected_families.add(family);
    document.getElementById(family + "_choice").classList.remove("selected");
}
function toggleFamily(family) {
    //function called whenever you click on a family choice in the settings grid, see init.js
    let was_selected = document.getElementById(family + "_choice").classList.contains("selected");
    was_selected ? deselect(family) : select(family);
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

    //switch preset highlighting
    document.querySelectorAll(".select").forEach(el => el.classList.remove("selected"));
    if(id){document.querySelector("#" + id).classList.add("selected");} //can pass id=null to just remove highlighting

    if(id == "select_all"){
        nonselected_families.forEach((f) => {select(f)});
    }
    else if(id == "select_none"){
        selected_families.forEach((f) => {deselect(f)});
    }
    else if(id in presets){
        for(let f in family_obs){
            presets[id].includes(f) ? select(f) : deselect(f);
        }
    }
    else if(id == "select_diverse"){
        //select top 10 families with the most species
        let sorted_diverse = Object.keys(family_obs).sort(NSpeciesComparator); //sort.js
        for(let i=0; i<10; i++){
            select(sorted_diverse[i]);
        }
    }
}