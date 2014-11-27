/**
 * Created by Nikola on 021, 21, Nov.
 */
(function($){
    $(document).ready(function(){

        $("p.view").on("click", function(event) {
            alert ('Hello!');
        });

        $('p.left').on('click', function(event) {
            alert ('Hello left!');
        });

        $('p.right').on('click', function(event) {
            alert ('Hello right!');
        });
    });
}(jQuery));