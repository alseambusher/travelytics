city = {name: 'New York', latitude: -25.363, longitude: 131.044, description: "", categories: [], image: ""};
latlng = {lat : -25.363, lng : 131.044};
var map;
function initMap() {
    //Initialize a map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat : city['latitude'], lng : city['longitude']}
    });

    //Plot a marker at the airport of the city
    center = drawMarker(map, city);

    //Access API endpoint to get top popular spots
    var locations;
    $.ajax({
        method: "POST",
        url: 'http://093cbf8b.ngrok.io/interest',
        data: JSON.stringify({city : city['name']}),
        contentType: 'application/json',
        success: function(data){
            console.log(data);
            locations = data['locations']
            console.log(locations);

            //Get distance matrix

            //Order the points
            //location = city;


            //locations = [{name: 'AAAAA', latitude: -20.363, longitude: 135.044, description: "adkh", categories: [], image: ""}, {name: 'BBBBB', latitude: -29.363, longitude: 126.044, description: "lksajkl", categories: [], image: ""}]

            //Plot the points
            plotLocations(map, locations);

            //Plot the paths
            //plotPaths(map, locations);
        }
    });
}

function drawMarker(map, location) {
    var marker = new google.maps.Marker({
        position: {lat : location['latitude'], lng : location['longitude']},
        map: map,
        title: location['name']
    });
    var contentString = '<div id="' + location['name'] + '">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h3 id="firstHeading" class="firstHeading">' + location['name'] + '</h3>'+
        '<div id="bodyContent">'+
        '<p>' + location['description'] + '</p>'+
        '<img src="' + location['image'] + '" alt="' + location['name'] +'" style="width:50;height:50;">' +
        '</div>'+
        '</div>';
    try{
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }
    catch(err){
        var e = marker._eventListeners[0];
        marker.removeEventListener(e.event, e.callback);
        contentString = '<div id="' + location['name'] + '">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h3 id="firstHeading" class="firstHeading">' + location['name'] + '</h3>'+
            '<div id="bodyContent">'+
            '<p>' + location['description'] + '</p>'+
            '</div>'+
            '</div>';
        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        });
    }
    //return marker;
}

function plotLocations(map, locations) {
    for(i = 0; i < locations.length; i++){
        drawMarker(map, locations[i]);
    }
}
