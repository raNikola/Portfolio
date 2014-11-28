/**
 * Created by Nikola on 021, 21, Nov.
 */
(function($){
    $(document).ready(function(){

        $(".prev").on("click", function(event) {
            alert ('Hello prev!');
        });

        $('.next').on('click', function(event) {
            alert ('Hello next!');
        });

        $('.view').on('click', function(event) {
            alert ('Hello view!');
        });
    });
}(jQuery));