addEventListener("scroll", updateVisibleTracks);

function updateVisibleTracks(){
    let tracks = document.querySelectorAll(".track:not(.fade_in)");
    tracks.forEach(p => {
        let box = p.getBoundingClientRect();
        if(box.top + 60 < window.innerHeight){
            p.classList.add("fade_in");
        }
    });
}

window.addEventListener("load", updateVisibleTracks);