//home = {name: 'Home', latitude: 34.0224, longitude: -118.25, description: "", categories: [], image: ""};
//destination = {name: 'Glasgow', latitude: 55.8642, longitude: -4.2518, description: "", categories: [], image: ""};
//fromAirport = {name: 'Glasgow', latitude: 55.8642, longitude: -4.2518, description: "", categories: [], image: ""};
//toAirport = {name: 'Glasgow', latitude: 55.8642, longitude: -4.2518, description: "", categories: [], image: ""};
var homeName = ""
var destinationName = ""
var base_url = 'http://173.236.121.79:5000'
var map;
function initMap(hname, dname) {
    //Initialize a map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: {lat : 45, lng : 0}
    });

    //Access API endpoint to get top popular spots
    var locations;
    $.ajax({
        method: "POST",
        url: 'http://173.236.121.79:5000/nearestAirport',
        data: JSON.stringify({source : hname ? hname : homeName, destination : dname ? dname : destinationName}),
        contentType: 'application/json',
        success: function(data){
            if(data.price)
              set_price(data.price);
            home = data['home'];
            destination = data['destination'];
            fromAirport = data['fromAirport'];
            toAirport = data['toAirport'];
            stops = data['stops'];
            console.log(home, destination, fromAirport, toAirport);

            //Plot a marker at the airport of the toAirport
            toAirportMarker = drawMarker(map, toAirport);
            fromAirportMarker = drawMarker(map, fromAirport);
            homeMarker = drawMarker(map, home);
            //Access API endpoint to get top popular spots
            var locations;
            $.ajax({
                method: "POST",
                url: 'http://173.236.121.79:5000/interest',
                data: JSON.stringify({toAirport : destination['name']}),
                contentType: 'application/json',
                success: function(data2){
                    //console.log(data);
                    console.log(data2);
                    locations = data2['locations']
                    //console.log(locations);

                    // TODO make this in order
                    add_to_itinenary_list(fromAirport.name, ()=>{
                        onClickEventHandler(fromAirport.latitude, fromAirport.longitude);
                    });

                    stops.forEach((elt) => {
                      add_to_itinenary_list(elt.name, ()=> {
                        onClickEventHandler(elt.latitude, elt.longitude);
                      });
                    });

                    add_to_itinenary_list(toAirport.name, ()=>{
                        onClickEventHandler(toAirport.latitude, toAirport.longitude);
                    });

                    locations.forEach((elt) => {
                      add_to_place_list(elt.name, ()=> {
                        onClickEventHandler(elt.latitude, elt.longitude);
                      });

                      add_to_itinenary_list(elt.name, ()=> {
                        onClickEventHandler(elt.latitude, elt.longitude);
                      });
                    });

                    //Get distance matrix
                    var path = getPath(toAirport, locations);
                    console.log(path);
                    //Plot the points
                    plotLocations(map, locations);

                    //Plot the paths
                    plotRoute(map, path);
                    //console.log(toAirport, path[0])
                    plotPath(map, toAirport, path[0], 1);
                    plotPath(map, home, fromAirport, 1);
                    plotFlightPath(map, fromAirport, toAirport, stops);
                    hide_progress_bar();
                    //Draw path from home to airport

                    //Draw path from airport1 to airport2

                }
            });
        }
    });
}

// Takes 2 arduments
// 1. google map object
// 2. location object having keys (name, latitude, longitude, description, image, categories)
function drawMarker(map, location) {
    var marker = new google.maps.Marker({
        position: {lat : location['latitude'], lng : location['longitude']},
        map: map,
        title: location['name'],
        animation: google.maps.Animation.DROP
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

function plotRoute(map, path) {
    for(i = 0; i < path.length - 1; i++) {
        plotPath(map, path[i], path[i + 1], "green")
    }
}

function plotPath(map, start, end, type){
    //console.log(start, end);
    var directionsDisplay = new google.maps.DirectionsRenderer;//{ polylineOptions: { strokeColor: "#8b0013" } };
    var directionsService = new google.maps.DirectionsService;
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );
    directionsService.route({
        origin: new google.maps.LatLng(start['latitude'],start['longitude']),
        destination: new google.maps.LatLng(end['latitude'],end['longitude']),
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            console.log('Directions request failed due to ' + status);
        }
    });
}

function plotFlightPath(map, fromAirport, toAirport, stops){
    console.log(stops);
    var flightPlanCoordinates = new Array(1 + stops.length + 1);
    for(var i = 0; i < stops.length; i++){
        drawMarker(map, stops[i]);
    }
    flightPlanCoordinates[0] = new google.maps.LatLng(fromAirport['latitude'], fromAirport['longitude']);
    flightPlanCoordinates[1 + stops.length] = new google.maps.LatLng(toAirport['latitude'], toAirport['longitude']);
    for(var i = 1; i <= stops.length; i++) {
        flightPlanCoordinates[i] = new google.maps.LatLng(stops[i - 1]['latitude'], stops[i - 1]['longitude'])
    }
    console.log(flightPlanCoordinates);
    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    flightPath.setMap(map);
}

function onClickEventHandler(latitude, longitude) {
    var center = new google.maps.LatLng(latitude, longitude);
    map.panTo(center);
    map.setZoom(15);
}
