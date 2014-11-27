/**
 * Created by Nikola on 022, 22, Nov.
 */
(function($){
    $(function() {
        var wrapper = $('#slidesWrapper'),
            container = $('#slidesContainer'),
            slides = container.children(),
            thumbs = $('#thumbnails').children();

        container.css('left', '0');

        thumbs.click(function() {
            var index = $('thumbnails').children().index(this);

            container.stop().animate({
                left: '-' + slides.eq(index).position().left + 'px'
            }, 1000);
        });
    });
})(jQuery);