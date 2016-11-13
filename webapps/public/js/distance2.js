function getPaths(origin, locations, callback){
  for(i = 0; i < locations.length; i++){
    locationsLatLng[i] = new google.maps.LatLng(locations[i]['latitude'],locations[i]['longitude'])
    console.log(locationsLatLng[i])
  }
  callback();
}

function getPath(origin, locations){
  var locationsLatLng = new Array(locations.length);
  var path = new Array(locations.length);
  var service = new google.maps.DistanceMatrixService();
  getPaths(origin, locations, function() {
    console.log(locationsLatLng)
    console.log("fds")
    service.getDistanceMatrix(
    {
        origins: locations,
        destinations: locations,
        travelMode: 'DRIVING',
    }, callback);

    function callback(response, status) {
      console.log("distanceMatrix done");
      if (status == 'OK') {
        distanceMatrix = new Array(locations.length);
        for (var i = 0; i < origins.length; i++) {
          distanceMatrix[i] = new Array(locations.length);
          var results = response.rows[i].elements;
          for (var j = 0; j < results.length; j++) {
            distanceMatrix[i][j] = results[j].distance.text;
          }
        }
        console.log(distanceMatrix);
        service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: locations,
            travelMode: 'DRIVING',
        }, callback2);

        function callback2(response, status) {
          var min = 0;
          var distance = response.rows[0].elements;
          for(var i = 1; i < distance.length; i++) {
            if(distance[i].distance.text < distance[min].distance.text)
              min = i;
          }
          var visitedNodes = new Array(locations.length);
          var visited = 0;
          path[0] = locations[min];
          visitedNodes[min] = 1;
          visited = 1;
          var k = min;
          while(visited < locations.length){
            var distanceVector = distanceMatrix[k];
            min = -1;
            for(var l = 0; l < locations.length; l++) {
              if(l != k && visitedNodes[l] != 1){
                if(min == -1 || distanceVector[min].distance.text > distanceVector[l].distance.text)
                  min = l;
              }
            }
            visitedNodes[min] = 1;
            path[visited] = distanceVector[min];
            visited = visited + 1;
          }
          console.log(path);
        }
      }
    }
  });
}