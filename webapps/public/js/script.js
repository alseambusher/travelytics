/*jshint esversion: 6 */

/*********** MessageBox ****************/
// simply show info.  Only close button
function infoMessageBox(message, title){
	$("#info-body").html(message);
	$("#info-title").html(title);
	$("#info-popup").modal('show');
}

// simply show info.  Only close button. large window
function infoMessageBoxLg(message, title){
	$("#info-body-lg").html(message);
	$("#info-title-lg").html(title);
	$("#info-popup-lg").modal('show');
}

// modal with full control
function messageBox(body, title, ok_text, close_text, callback){
	$("#modal-body").html(body);
	$("#modal-title").html(title);
	if (ok_text) $("#modal-button").html(ok_text);
	if(close_text) $("#modal-close-button").html(close_text);
	$("#modal-button").unbind("click"); // remove existing events attached to this
	$("#modal-button").click(callback);
	$("#popup").modal("show");
}
/*********** dash actions ****************/

function my_location(){
		FB.api('/me/tagged_places', 'GET', (data) => {
			data = data.data;
			var output = "<div class='list-group'>";
			for (var i=0; i<data.length; i++){
				output += `<a href="#" class="list-group-item ` + (i%2==0? "active" : "") + `">
				<b class="list-group-item-heading">` + data[i].place.name+ `</b>
				<p class="list-group-item-text">` + data[i].place.location.city + `</p>
				</a>`;
			}
			output += "</div>";
			console.log(data);
			infoMessageBoxLg(output, "My Locations");
		});
}

function set_username(){
	FB.api('/me', 'get', (data)=>{
		document.getElementById("username").innerHTML = data.name ? data.name : "";
	});
}

function put_url_data(){
	var data = {};
	FB.api('/me', 'get', (user) => {
		data.name = user.name;
		data.id= user.id;
		FB.api('/me/tagged_places', 'get', (places) => {
			data.places = places;
			FB.api("/me/friends", "GET", (friends) => {
				data.friends = friends;
				$.post( "/", data, function() {}, "json");
			});
		});
	});
}

function get_trip_plan(source,destination)
{
	show_progress_bar();
	initMap(source, destination);
	setTimeout(()=>{
		document.getElementById("map").style.position = "static";
		google.maps.event.trigger(document.getElementById("map"), 'resize');
	}, 1000);
	document.getElementById("places_in_location").style.display = "inline";
	document.getElementById("places_in_itinenary").style.display = "inline";
	document.getElementById("location").innerHTML = destination;
	document.getElementById("place_list").innerHTML = "";
	document.getElementById("place_itinenary").innerHTML = "";

}


function plan_trip_form(){
	let body = `<form><input placeholder="From" type="text" required="" id="plan_trip_source"></form>
				<form><input placeholder="Destination" type="text" required="" id="plan_trip_destination"></form>`;
	messageBox(body, "Plan Trip", "Search", "Cancel", () => {
		console.log("clicked")
		FB.api('/me', 'get', (user) => {
			console.log(user)
			$.get(routes.recommend + "?uid="+ user.id, function(data) {
					console.log(data.matches);
					document.getElementById("trip_switcher").innerHTML = "";
					if(document.getElementById('plan_trip_destination').value != "")
					{
						get_trip_plan(document.getElementById('plan_trip_source').value,document.getElementById('plan_trip_destination').value)
					}

					if (data.matches.length > 0)
					{
						let a = document.createElement("a");
						a.className = "mdl-navigation__link";
						a.innerHTML = "<b>Suggestions</b>";
						document.getElementById("trip_switcher").appendChild(a);
					}
					for (let i=0; i<data.matches.length; i++)
					{
						let a = document.createElement("a");
						a.className = "mdl-navigation__link";
						a.innerHTML = document.getElementById("plan_trip_source").value + ' <i class="material-icons">trending_flat</i> ' + data.matches[i];
						document.getElementById("trip_switcher").appendChild(a);
						a.onclick = function()
						{
							get_trip_plan(document.getElementById('plan_trip_source').value,data.matches[i])
						};
					}

						

				});
				//
			});
		});
	}

function add_to_place_list(place, click){
	let li = document.createElement("li");
	li.innerHTML = place;
	li.onclick = click;
	li.className = "mdl-menu__item";
	document.getElementById("place_list").appendChild(li);
}

function add_to_itinenary_list(place, click){
	let li = document.createElement("li");
	li.innerHTML = place;
	li.onclick = click;
	li.className = "mdl-menu__item";
	document.getElementById("place_itinenary").appendChild(li);
}

function show_progress_bar(){
	document.getElementById("progress_bar").style.visibility = "visible";
}
function hide_progress_bar(){
	document.getElementById("progress_bar").style.visibility = "hidden";
}
function set_price(value){
	document.getElementById("price").innerHTML = "$"+value;
}
