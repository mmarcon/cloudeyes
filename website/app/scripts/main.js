$(function(){
    'use strict';
    var w = $(window),
        container = $('.container');
    w.on('scroll', function(){
        if(w.scrollTop() >= 400) {
            return container.addClass('sticky-header');
        }
        container.removeClass('sticky-header');
    });
});