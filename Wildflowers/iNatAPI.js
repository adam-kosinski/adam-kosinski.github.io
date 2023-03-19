let last_search_time = -Infinity;
let timeout_id = undefined;

function updatePlaceSearchResults(e){
    //retrieve possible place names from iNaturalist, only do once per second at most
    //do this by checking time since last api call, and if not more than 1 sec, setting a timeout
    //whenever this function is called, cancel the timeout, since we have new data

    clearTimeout(timeout_id);

    let now = performance.now();
    let diff = now - last_search_time;
    if (diff < 1000){
        timeout_id = setTimeout(updatePlaceSearchResults, 1001-diff, e); //extra 1ms to be safe
    }
    else {
        last_search_time = now;

        fetch(`https://api.inaturalist.org/v1/places/autocomplete?q=${e.target.value}&order_by=area`)
            .then(response => response.json())
            .then(data => {
                //sort places by assigning scores = bounding box area / long-lat distance from user
                //bigger scores are ranked higher
                //i.e. want small distance and large bounding box area, but balanced out sort of
                data.results.sort((a,b) => {
                    let a_split = a.location.split(",");
                    let a_lat = Number(a_split[0]);
                    let a_long = Number(a_split[1]);
                    let a_dist = Math.hypot(user_location.latitude - a_lat, user_location.longitude - a_long);

                    let b_split = b.location.split(",");
                    let b_lat = Number(b_split[0]);
                    let b_long = Number(b_split[1]);
                    let b_dist = Math.hypot(user_location.latitude - b_lat, user_location.longitude - b_long);

                    return b.bbox_area/b_dist - a.bbox_area/a_dist;
                });

                

                // check if input value is a valid place
                let datalistID = e.target.getAttribute("list");
                let datalist = document.getElementById(datalistID);
                let options = datalist.childNodes;

                let valid_place = false;
                for(let i=0; i<data.results.length; i++){
                    if(data.results[i].display_name == e.target.value){
                        document.getElementById("valid_place").style.display = "inline-block";
                        document.getElementById("invalid_place").style.display = "none";
                        document.getElementById("fetch_observations").removeAttribute("disabled");
                        custom_place = data.results[i];
                        obs = []; //new place, new observations
                        return;
                    }
                }
                // not valid, update display
                document.getElementById("valid_place").style.display = "none";
                document.getElementById("invalid_place").style.display = "inline-block";
                document.getElementById("fetch_observations").disabled = true;
                custom_place = undefined;
                

                // if not valid place, update datalist and custom place options, also indicate not valid place
                // only doing if not valid place so we don't re-popup the datalist
                datalist.innerHTML = "";
                data.results.forEach(place => {
                    let option = document.createElement("option");
                    option.textContent = place.display_name;
                    datalist.appendChild(option);
                });
            });
    }
}


function fetchObservations(place_id, taxon_id){
    //disable the button and show a loader while the observations are being fetched
    document.getElementById("fetch_observations").disabled = true;

    console.log(place_id, taxon_id)

    let url = `https://api.inaturalist.org/v1/observations?
                    photos=true
                    &licensed=true
                    &photo_licensed=true
                    &place_id=${place_id}
                    &taxon_id=${taxon_id}
                    &quality_grade=research
                    &per_page=10
                    &order=desc
                    &order_by=created_at`.replaceAll(/\s/g, "");
    
    fetch(url).then(res => res.json()).then(data => {
        console.log(data);

        let obs_to_add = [];
        data.results.forEach(obj => {
            obs_to_add.push({
                id: obj.id,
                user_name: obj.user.name ? obj.user.name : "",
                license: obj.license_code,
                image_url: obj.photos[0].url.replace("square", "medium"),
                scientific_name: obj.taxon.name,
                common_name: obj.taxon.preferred_common_name ? obj.taxon.preferred_common_name : "",
                taxon_family_name: "Asteraceae"
            })
        });

        init(undefined, obs_to_add);

        document.getElementById("fetch_observations").removeAttribute("disabled");
    });
}