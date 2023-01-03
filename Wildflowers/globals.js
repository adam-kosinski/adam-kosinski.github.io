let datasets = {}; //populated by the csv js files

let obs, family_obs, family_species, family_data;
let selected_families = []; //families selected in settings panel
let nonselected_families = [];
let other_rate = 1 / 5; //rate at which to show a non-selected family, to be identified as "other"
let current_tuple;
let guessing = false; //for handling pressing the enter key
let zoom_img_visible = false; //see mousemove event handler, so we don't need to ref the DOM every mousemove

let license_links = {
    "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
    "CC-BY": "https://creativecommons.org/licenses/by/4.0/",
    "CC-BY-NC": "https://creativecommons.org/licenses/by-nc/4.0/",
    "CC-BY-NC-ND": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    "CC-BY-NC-SA": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    "CC-BY-ND": "https://creativecommons.org/licenses/by-nd/4.0/",
    "CC-BY-SA": "https://creativecommons.org/licenses/by-sa/4.0/"
};

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