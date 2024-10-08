addEventListener("scroll", updateVisibleProjects);

function updateVisibleProjects(){
    let projects = document.querySelectorAll(".project:not(.fade_in)");
    projects.forEach(p => {
        let box = p.getBoundingClientRect();
        if(box.top + 125 < window.innerHeight){
            p.classList.add("fade_in");
        }
    });
}

window.addEventListener("load", updateVisibleProjects);