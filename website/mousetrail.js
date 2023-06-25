let spawn_range = 20; // in px, max dist (x and y separate) away from the mouse we can spawn particles 
let drift_range = 20; // in px, max dist (x and y separate) a particle can drift

document.addEventListener("mousemove", handleMoveEvent);


let prev_touchmove;
document.addEventListener("touchmove", function(e){
    e.preventDefault();

    let touchmove = {
        pageX: e.touches[0].pageX,
        pageY: e.touches[0].pageY
    };
    touchmove.movementX = prev_touchmove ? touchmove.pageX - prev_touchmove.pageX : 0;
    touchmove.movementY = prev_touchmove ? touchmove.pageY - prev_touchmove.pageY : 0;

    handleMoveEvent(touchmove);
    prev_touchmove = touchmove;

}, {passive: false}); //iOS safari weirdness



function handleMoveEvent(e){
    //prevent excessive particles if the mouse isn't moving very much
    if(Math.hypot(e.movementX, e.movementY) < 2 && Math.random() < 0.5) return;

    createParticle(e.pageX, e.pageY);

    //fill in the gap between mousemoves with another particle
    let dist = Math.hypot(e.movementX, e.movementY);
    if(dist > 30) {
        createParticle(e.pageX - e.movementX/3, e.pageY - e.movementY/3);
        createParticle(e.pageX - 2*e.movementX/3, e.pageY - 2*e.movementY/3);
    }
    else if(dist > 20){
        createParticle(e.pageX - e.movementX/2, e.pageY - e.movementY/2);
    }
}

function createParticle(pageX, pageY){
    let p = document.createElement("img");
    p.classList.add("particle");

    //set star type
    if(Math.random() < 0.3){
        p.src = "website/images/four_pointed_star.svg";
    }
    else if(Math.random() < 0.4){
        p.src = "website/images/eight_pointed_star.svg";
    }
    else {
        p.src = "website/images/small_star.svg";
    }

    //set star position, size, and movement direction
    p.style.top = pageY + spawn_range*Math.random() + "px";
    p.style.left = pageX + spawn_range*Math.random() + "px";
    let scale = "scale(" + (0.25 + 1.5*Math.random()) + ")";
    p.style.transform = scale + " translate(-50%, -50%)";
    let translateX = "calc(-50% + " + drift_range*(1-2*Math.random()) + "px)";
    let translateY = "calc(-50% + " + drift_range*(1-2*Math.random()) + "px)";
    p.style.setProperty("--end-transform", `translate(${translateX}, ${translateY}) ${scale}`)
    // p.style.setProperty("--end-top", pageY + drift_range*(1-2*Math.random()) + "px");
    // p.style.setProperty("--end-left", pageX + drift_range*(1-2*Math.random()) + "px");

    //set star shadow color
    let colors = ["#00f6","#f0f6"];
    let color = colors[Math.floor(colors.length*Math.random())];
    p.style.setProperty("--shadow-color", color);

    document.body.appendChild(p);

    p.addEventListener("animationend", function(){
        document.body.removeChild(p);
    });
}