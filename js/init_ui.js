var places = [];

    function init_places() {
        $.ajax({
            url: "getPlaces.php?mode=single",
            cache: false
        }).done(function( html ) {
            //process data
            places = JSON.parse(html);

            //check if we got back some data
            if(places.length > 0)
            {
                // TODO:
                console.log(places);
                //place_template = '<li></li>';
                for(i=0; i<places.length; i++) {
                    $('#tab-container ul').append('<li id="'+places[i]+'" onclick="click_handler(event);">'+places[i]+' </li>');
                }
                $("ul li:first").click();
		
            }
            //we have no data so hide the chart 
            else {
                // TODO:
            }
        });
    }

var places_array = {
    "Meeting Room 1": "place0",
    "Coffee Point 1": "place1"
};

function click_handler(event) {
    //$("#charts").hide();
    $("ul li").each(function (index, item){
        var id = this.id;
        if(id == event.target.id) {
            $(this).addClass("selected");
                console.log(id);
            } else {
                $(this).removeClass("selected");
            }
        }
    );
    //init_chart(places_array[event.target.id]);
    $("#place_title").html("Temperature and Humidity Daily Trend <br> Location - "+event.target.id);
}

$(document).ready(function () {
    init_places();
    console.log('Ready!');
});
