let datasets = {}; //populated by the csv js files

let obs, family_obs, family_species, family_data;
let selected_families = []; //families selected in settings panel
let nonselected_families = [];
let other_rate = 1/5; //rate at which to show a non-selected family, to be identified as "other"
let current_tuple;
let guessing = false; //for handling pressing the enter key
let zoom_img_visible = false; //see mousemove event handler, so we don't need to ref the DOM every mousemove

let easy_families = new Set([
    "Asteraceae",
    "Boraginaceae",
    "Cactaceae",
    "Typhaceae",
    "Onagraceae",
    "Scrophulariaceae",
    "Geraniaceae",
    "Grossulariaceae",
    "Cucurbitaceae",
    "Vitaceae",
    "Poaceae",
    "Ericaceae",
    "Iridaceae",
    "Liliaceae",
    "Malvaceae",
    "Lamiaceae",
    "Brassicaceae",
    "Solanaceae",
    "Orchidaceae",
    "Arecaceae",
    "Apiaceae",
    "Fabaceae",
    //"Pinaceae", //not actually an angiosperm
    "Caryophyllaceae",
    "Rosaceae",
    "Saxifragaceae",
    "Urticaceae",
    "Violaceae",
    "Salicaceae"
]);

let custom_sets = {
    "adam": ['Asteraceae', 'Lamiaceae', 'Fabaceae', 'Scrophulariaceae', 'Apiaceae', 'Geraniaceae', 'Rosaceae', 'Ericaceae', 'Orchidaceae', 'Brassicaceae', 'Boraginaceae', 'Saxifragaceae', 'Plantaginaceae', 'Convolvulaceae', 'Rubiaceae'],
    "five united petals": ['Apocynaceae', 'Boraginaceae', 'Campanulaceae', 'Cucurbitaceae', 'Ericaceae', 'Gentianaceae', 'Scrophulariaceae', 'Solanaceae', 'Verbenaceae', 'Vitaceae']
}