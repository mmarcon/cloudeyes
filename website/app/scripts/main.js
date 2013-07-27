$(function(){
    var body = $('body'),
        container = $('.container');
    $(window).on('scroll', function(){
        if(body.scrollTop() >= 400) {
            return container.addClass('sticky-header');
        }
        container.removeClass('sticky-header');
    });
});