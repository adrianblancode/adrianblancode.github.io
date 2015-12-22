//Toggles the visibility of the menu
function toggleMenu(){

    var nav = $('#sidebar');
    
    if(!nav.hasClass("open")){
        nav.addClass("open");
    } else {
        nav.removeClass("open");
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
    var scrolled = true;
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

            //We remove the transparency on the menu if we have left the home area
            scrolled = !(refElement.selector == "#home");
        }
        else{
            currLink.removeClass("active");
        }
    });

    //This fulhaxx is required to stop flashing at certain parts
    if(scrolled){
        $("#sidebar").addClass("scrolled");
    } else {
        $("#sidebar").removeClass("scrolled");
    }
}

// Initially, we're not waiting, we return a throttled function
// If we're not waiting, execute users function prevent future invocations
// After a period of time, and allow future invocations
function throttle (callback, limit) {
    var wait = false;
    return function () {
        if (!wait) {
            callback.call();
            wait = true;
            setTimeout(function () {
                wait = false;
            }, limit);
        }
    }
}

function callPlayer(func, args) {
    var iframes = document.getElementsByTagName('iframe');
    for (var i = 0; i < iframes.length; ++i) {
        if (iframes[i]) {
            var src = iframes[i].getAttribute('src');
            if (src) {
                if (src.indexOf('youtube.com/embed') != -1) {
                    iframes[i].contentWindow.postMessage(JSON.stringify({
                        'event': 'command',
                        'func': func,
                        'args': args || []
                    }), "*");
                }
            }
        }
    }
}