function togglePassword(id, icon) {
    var x = document.getElementById(id);
    if (x.type === "password") {
        x.type = "text";
        var element = document.getElementById(icon);
        element.classList.remove("glyphicon-eye-open");
        element.classList.add("glyphicon-eye-close");

    } else {
        x.type = "password";
        var element = document.getElementById(icon);
        element.classList.remove("glyphicon-eye-close");
        element.classList.add("glyphicon-eye-open");
    }
}

$(function () {
    $(".datepicker").datepicker({ maxDate: "-1M" });
    $(".datepicker").datepicker("option", "dateFormat", "yy-mm-dd");
});


$(document).ready(function () {
    $.each($('#navbar').find('li'), function () {
        $(this).toggleClass('active',
            window.location.pathname.indexOf($(this).find('a').attr('href')) > -1);
    });
});