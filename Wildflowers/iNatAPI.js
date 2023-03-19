let last_search_time = -Infinity;
let timeout_id = undefined;

function updatePlaceSearchResults(e){
    //retrieve possible place names from iNaturalist, only do once per second at most
    //do this by checking time since last api call, and if not more than 1 sec, setting a timeout
    //whenever this function is called, cancel the timeout, since we have new data

    clearTimeout(timeout_id);
    clearData(); //also do this since it's a new place, existing data is no longer relevant

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
                if(user_location !== undefined){
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
                }                

                // check if input value is a valid place
                let datalistID = e.target.getAttribute("list");
                let datalist = document.getElementById(datalistID);

                for(let i=0; i<data.results.length; i++){
                    if(data.results[i].display_name == e.target.value){
                        document.getElementById("valid_place").style.display = "inline-block";
                        document.getElementById("invalid_place").style.display = "none";
                        custom_place = data.results[i];

                        //determine page fetch order (get page range, shuffle possible pages)
                        fetch(obsURL(custom_place.id, angiosperm_taxon_id, 1, 1, true))
                        .then(res => res.json())
                        .then(data => {
                            let n_obs = Math.min(10000, data.total_results); //only grab from first 10000 results to comply with API rules
                            let n_pages = Math.ceil(n_obs/200);
                            let pages = [];
                            for(let i=1; i<=n_pages; i++){
                                pages.push(i);
                            }
                            //shuffle into the global pages_to_fetch var
                            while(pages.length > 0){
                                let idx = Math.floor(pages.length*Math.random());
                                pages_to_fetch.push(pages.splice(idx, 1)[0]);
                            }
                            document.getElementById("fetch_observations").removeAttribute("disabled");
                        });
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


function obsURL(place_id, taxon_id, per_page=200, page=1, only_id=false){
    return `https://api.inaturalist.org/v1/observations?
                photos=true
                &licensed=true
                &photo_licensed=true
                &place_id=${place_id}
                &taxon_id=${taxon_id}
                &quality_grade=research
                &page=${page}
                &per_page=${per_page}
                &only_id=${only_id}
                &order=desc
                &order_by=created_at`.replaceAll(/\s/g, "");
}


function fetchObservations(place_id, taxon_id){
    //disable the input and show a loader while the observations are being fetched
    document.getElementById("dataset_select").disabled = true;
    document.getElementById("place_input").disabled = true;
    document.getElementById("fetch_observations").disabled = true;

    //get the next page from the shuffled order
    let page = pages_to_fetch.pop();
    let url = obsURL(place_id, taxon_id, 200, page);
    
    fetch(url).then(res => res.json()).then(data => {
        console.log(data)

        let obs_to_add = [];
        data.results.forEach(obj => {
            let family_name;
            for(let f in family_data){
                let f_id = Number(family_data[f].id)
                if(obj.taxon.ancestor_ids.includes(f_id)){
                    family_name = f;
                    break;
                }
            }
            
            obs_to_add.push({
                id: obj.id,
                user_name: obj.user.name ? obj.user.name : "",
                license: obj.license_code,
                image_url: obj.photos[0].url.replace("square", "medium"),
                scientific_name: obj.taxon.name,
                common_name: obj.taxon.preferred_common_name ? obj.taxon.preferred_common_name : "",
                taxon_family_name: family_name
            })
        });

        init(undefined, obs_to_add);

        //enable input
        document.getElementById("dataset_select").removeAttribute("disabled");
        document.getElementById("place_input").removeAttribute("disabled");

        if(pages_to_fetch.length > 0){
            document.getElementById("fetch_observations").removeAttribute("disabled");
            document.getElementById("fetch_observations").textContent = "Fetch More Images";
        }
        else {
            document.getElementById("fetch_observations").style.display = "none";
            document.getElementById("all_images_fetched").style.display = "block";
        }
    });
}