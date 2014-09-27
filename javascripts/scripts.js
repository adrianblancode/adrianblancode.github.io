//Toggles the visibility of the element specified by id
function toggle(id){
    var elem = document.getElementById(id);
    
    console.log(elem.style.display);

    if(elem.style.display != "block"){
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}