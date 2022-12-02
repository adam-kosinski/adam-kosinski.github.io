function capitalize(str){
    return str.replace(/^\w|(?<=\s)\w|-\w/g, function(char){
        return char.toUpperCase();
    });
}


function mouseOverImage(e, img_box){
    //takes the event object of a mousemove event
    //check if the mouse is actually over the plant image as displayed
    //since the object-fit: contain; css makes the image display smaller than its actual width and height

    if(e.target.id != "plant_img" || !e.target.complete) return false; //complete checks if img is loaded

    if(e.offsetX >= img_box.x && e.offsetX <= (img_box.x + img_box.width) &&
        e.offsetY >= img_box.y && e.offsetY <= (img_box.y + img_box.height)){
        return true;
    }
    return false;
}



function getImageBox(){
    //returns {x:_, y:_, width:_, height:_} of the plant display image
    //needed because the display position and size doesn't match the image position and size, due to the object-fit: contain; css

    let img = document.getElementById("plant_img");
    let out = {};

    let img_aspect_ratio = img.naturalWidth / img.naturalHeight;
    let container_aspect_ratio = img.clientWidth / img.clientHeight;

    if(img_aspect_ratio > container_aspect_ratio){
        //then image limited by width
        out.width = img.clientWidth;
        out.height = img.clientWidth / img_aspect_ratio;
    }
    else {
        //then image limited by height
        out.height = img.clientHeight;
        out.width = img.clientHeight * img_aspect_ratio;
    }

    out.x = (img.clientWidth - out.width) / 2;
    out.y = (img.clientHeight - out.height) / 2;

    return out;
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


function NSpeciesComparator(a,b){
    //takes family names a,b
    //returns -1, 0, or 1 appropriately
    let a_set = new Set();
    let b_set = new Set();
    family_obs[a].forEach(tuple => a_set.add(tuple.scientific_name));
    family_obs[b].forEach(tuple => b_set.add(tuple.scientific_name));
    return b_set.size - a_set.size;
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


// select the families I'm currently working on - no UI trigger for this, will use the console
let adam_families = ['Asteraceae', 'Lamiaceae', 'Fabaceae', 'Scrophulariaceae', 'Apiaceae', 'Geraniaceae', 'Rosaceae', 'Ericaceae', 'Orchidaceae', 'Brassicaceae', 'Boraginaceae', 'Saxifragaceae', 'Plantaginaceae', 'Convolvulaceae', 'Rubiaceae'];
function selectAdam(){
    selectNone();

    for(let i=0; i<adam_families.length; i++){
        let family = adam_families[i];
        if(family_obs.hasOwnProperty(family)){
            selected_families.push(family);
            nonselected_families.splice(nonselected_families.indexOf(family), 1);
            document.getElementById(family + "_choice").classList.add("selected");
        }
    }
}