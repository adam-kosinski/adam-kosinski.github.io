document.addEventListener("keypress", handleKeypress);
document.addEventListener("click", handleClick);

function handleKeypress(e){
    if(e.key == "Enter"){
        if(still_guessing){
            checkAnswer();
        }
        else {
            nextPlant();
        }
    }
}

function handleClick(e){
    if(e.target.id == "next_plant"){
        nextPlant();
    }
}




function checkAnswer(){
    let guess_input = document.getElementById("guess");
    let feedback = document.getElementById("feedback");

    guess_input.readOnly = true;
    document.getElementById("common_name").textContent = capitalize(current_tuple.common_name);
    document.getElementById("scientific_name").textContent = current_tuple.scientific_name;
    document.getElementById("family_name").textContent = current_tuple.taxon_family_name;
    document.getElementById("answers").style.display = "block";

    if(guess_input.value.toLowerCase() == current_tuple.taxon_family_name.toLowerCase()){
        feedback.className = "correct";
        feedback.textContent = "Correct!";
    }
    else {
        feedback.className = "incorrect";
        feedback.textContent = "Nope, correct: " + current_tuple.taxon_family_name;
    }

    still_guessing = false;
}


function nextPlant(){

    document.getElementById("answers").style.display = "none";
    document.getElementById("feedback").textContent = "";
    
    still_guessing = true;

    current_tuple = obs[Math.floor(Math.random() * obs.length)]; //global var in init.js
    

    let img = document.getElementById("plant_img");
    img.src = current_tuple.image_url;
    let author_name = current_tuple.user_name;
    document.getElementById("img_author").textContent = author_name.length > 0 ? author_name + ". ": "";
    let inat_link = document.getElementById("inat_url");
    let url = "https://inaturalist.org/observations/" + current_tuple.id;
    inat_link.textContent = url;
    inat_link.href= url;

    let guess_input = document.getElementById("guess");
    guess_input.value = "";
    guess_input.readOnly = false;
    guess_input.focus();
}


function capitalize(str){
    return str.replace(/^\w|(?<=\s)\w|-\w/g, function(char){
        return char.toUpperCase();
    });
}