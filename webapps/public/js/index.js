city = {name: 'City', latitude: -25.363, longitude: 131.044};
latlng = {lat : -25.363, lng : 131.044};
var map;
function initMap() {
    //Initialize a map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat : city['latitude'], lng : city['longitude']}
    });

    //Plot a marker at the airport of the city
    drawMarker(map, city)

    //Access API endpoint to get top popular spots
    //{locations: [{name: 'sds', latitude: 23.32, longitude: 34.43}, {name: 'sds', latitude: 23.32, longitude: 34.43}]}

    //Get distance matrix

    //Order the points
    //location = city;

    locations = [{name: 'AAAAA', latitude: -24.363, longitude: 131.044}, {name: 'BBBBB', latitude: -26.363, longitude: 131.044}]
    //Plot the points

    //Plot the paths
  }

function drawMarker(map, location) {
    var marker = new google.maps.Marker({
        position: {lat : location['latitude'], lng : location['longitude']},
        map: map,
        title: location['name']
    });
}
