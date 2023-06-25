const spawn_range = 20; // in px, max dist (x and y separate) away from the mouse we can spawn particles 
const drift_range = 20; // in px, max dist (x and y separate) a particle can drift
const base_size = 14; //px for base width and height

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


document.addEventListener("touchend", function(){
    prev_touchmove = undefined; //don't play connect the dots between two different touch sessions
})


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
    
    let size = base_size * (0.25 + 1.5*Math.random());
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.top = pageY - 0.5*size + spawn_range*Math.random() + "px";
    p.style.left = pageX - 0.5*size + spawn_range*Math.random() + "px";
    let translateX = drift_range*(1-2*Math.random()) + "px";
    let translateY = drift_range*(1-2*Math.random()) + "px";
    p.style.setProperty("--end-transform", `translate(${translateX}, ${translateY})`)

    //set star shadow color
    let colors = ["#00f6","#f0f6"];
    let color = colors[Math.floor(colors.length*Math.random())];
    p.style.setProperty("--shadow-color", color);

    document.body.appendChild(p);

    p.addEventListener("animationend", function(){
        document.body.removeChild(p);
    });
}