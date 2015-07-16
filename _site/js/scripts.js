//Toggles the visibility of the menu
function toggleMenu(){

    var elem = document.getElementById('categories');
    
    if(elem.style.display != "block"){
        elem.style.display = "block";
        $("#sidebar").addClass("open");
    } else {
        elem.style.display = "none";
        $("#sidebar").removeClass("open");
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