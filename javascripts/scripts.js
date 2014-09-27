//Toggles the visibility of the element specified by id
function toggle(id){

    var elem = document.getElementById(id);
    
    if(elem.style.display != "block"){
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}

function toggleLogo(color){

    var dl = document.getElementById("dl");
    var ml = document.getElementById("ml");

    if(color == 'red'){
        ml.src = "images/logored.svg";
        dl.src = "images/logored.svg";
    } else {
        ml.src = "images/logo.svg";
        dl.src = "images/logo.svg";
    }
}