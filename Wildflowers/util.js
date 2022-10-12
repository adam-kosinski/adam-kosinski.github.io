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
    while(current != document.body){
        if(attr == "id" && current.id == value ||
            attr == "class" && current.classList.contains(value)
        ){
            return current;
        }
        current = current.parentElement;
    }
    return null;
}