// data stuff
let datasets = {}; //populated by the csv js files
let obs, family_obs, family_species, family_data;

// selection state
let selected_families = new Set([]); //families selected in settings panel
let nonselected_families = new Set([]);

// functionality state
let current_tuple;
let guessing = false; //for handling pressing the enter key
let zoom_img_visible = false; //see mousemove event handler, so we don't need to ref the DOM every mousemove

// custom place stuff
let custom_place = undefined; // when defined, is a JSON object representing the place (given by the iNaturalist API)
let user_location; //used for sorting place search results intelligently
fetch("https://geolocation-db.com/json/")
    .then(response => response.json())
    .then((data) => {user_location = data})


//config

let angiosperm_taxon_id = 47125;
let other_rate = 1 / 5; //rate at which to show a non-selected family, to be identified as "other"

let license_links = {
    "CC0": "https://creativecommons.org/publicdomain/zero/1.0/",
    "CC-BY": "https://creativecommons.org/licenses/by/4.0/",
    "CC-BY-NC": "https://creativecommons.org/licenses/by-nc/4.0/",
    "CC-BY-NC-ND": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
    "CC-BY-NC-SA": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    "CC-BY-ND": "https://creativecommons.org/licenses/by-nd/4.0/",
    "CC-BY-SA": "https://creativecommons.org/licenses/by-sa/4.0/"
};

//List of families with some info on T.J.Elpel's website, but not in the typical format (or a renamed family, etc)
//We check this list only if the usual method doesn't work (see init.js)
let elpel_redirects = {
    "Viburnaceae": "https://www.wildflowers-and-weeds.com/Plant_Families/Caprifoliaceae.htm",
    "Plantaginaceae": "https://www.wildflowers-and-weeds.com/Plant_Families/Plantaginaceae.htm", //because no notes or image
    "Sapindaceae": "https://www.wildflowers-and-weeds.com/Plant_Families/Aceraceae.htm" //maple subfamily only on the website
};