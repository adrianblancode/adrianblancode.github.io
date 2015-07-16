//Toggles the visibility of the element specified by id
function toggle(id){

    var elem = document.getElementById(id);
    
    if(elem.style.display != "block"){
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}

//Toggles the color of the logo when mouseover
function toggleLogo(color){

    var logo = document.getElementById("logo");

    if(color == 'red'){
        logo.src = "/images/logored.png";
    } else {
        logo.src = "/images/logo.png";
    }
}