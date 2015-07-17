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

//Determines which navigation to highlight
function onScroll(event){
    var scrollPos = $(document).scrollTop();
    $('#sidebar a:not(#mobile-nav a)').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));

        if($(window).scrollTop() + $(window).height() > $(document).height() - 100){
            currLink.removeClass("active");
            $("#sidebar a:last").addClass("active");
        }
        else if (refElement.selector != "#" && refElement.position().top <= scrollPos + 80 && refElement.position().top + refElement.height() > scrollPos) {
            $('#categories ul li a').removeClass("active");
            currLink.addClass("active");

            //We remove the transparency on the meny when scrolled down far enough
            if(refElement.selector == "#home"){
              $("#sidebar").removeClass("scrolled");

            } else {
              $("#sidebar").addClass("scrolled");
            }
        }
        else{
            currLink.removeClass("active");
        }
    });
}