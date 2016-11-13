function getPath(city, locations) {
	var distanceMatrix = new Array(locations.length);
	var path = new Array(locations.length);
	for(var i = 0; i < locations.length; i++) {
		distanceMatrix[i] = new Array(locations.length);
		for(var j = 0; j < locations.length; j++) {
			distanceMatrix[i][j] = Math.sqrt(Math.pow((locations[i]['latitude'] - locations[j]['latitude']), 2) + Math.pow((locations[i]['longitude'] - locations[j]['longitude']), 2));
		}
	}
	var min = -1;
	var minDistance = -1;
	for(var i = 0; i < locations.length; i++) {
		var distance = Math.sqrt(Math.pow((locations[i]['latitude'] - city['latitude']), 2) + Math.pow((locations[i]['longitude'] - city['longitude']), 2));
		if(min == -1 || distance < minDistance){
			minDistance = distance
			min = i;
		}
	}
	console.log(distanceMatrix);
	var visitedNode = new Array(locations.length);
	visitedNode[min] = 1;
	visited = 1;
	path[visited - 1] = locations[min];
	source = min;
	while(visited < locations.length) {
		min = -1;
		minDistance = -1;
		for(j = 0; j < locations.length; j++){
			if(source != j && visitedNode[j] != 1){
				var distance = Math.sqrt(Math.pow((locations[source]['latitude'] - locations[j]['latitude']), 2) + Math.pow((locations[source]['longitude'] - locations[j]['longitude']), 2));
				if(min == -1 || distance < minDistance){
					minDistance = distance
					min = j;
				}
			}			
		}
		visited = visited + 1;
		visitedNode[min] = 1;
		path[visited - 1] = locations[min];
		source = min;
	}
	console.log(path)
	return path;
}