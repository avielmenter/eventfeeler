import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import NavBar from './components/navbar.js'

import moment from 'moment';

ReactDOM.render(<NavBar />, document.getElementsByTagName("nav")[0]);

//*
var xmlhttp = new XMLHttpRequest();

var next_week = moment(new Date()).add(7, 'days');

var url = '/api/search/events?since=' + encodeURI(new Date());
url += '&until=' + encodeURI(next_week.toDate());

var locations;

xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		var myArr = JSON.parse(this.responseText);
		locations = JSON.parse(this.responseText);
	}
};

xmlhttp.open("GET", url, false);
xmlhttp.send();

var map = new google.maps.Map(document.getElementById('map'), {
	zoom: 12,
	center: new google.maps.LatLng(33.651964, -117.844886),
	mapTypeId: google.maps.MapTypeId.ROADMAP
});

var icon = {
	url: "images/marker.png", // url
	scaledSize: new google.maps.Size(50, 50), // size
};

var negIcon = {
	url: "images/neg.png", // url
	scaledSize: new google.maps.Size(50, 50), // size
};

var posIcon = {
	url: "images/pos.png", // url
	scaledSize: new google.maps.Size(50, 50), // size
};

var infowindow = new google.maps.InfoWindow();
var marker, i;

for (i = 0; i < locations.length; i++) {
	var id = locations[i]._id;
	var idUrl = "eventview.html?eventid="+id;
	if(locations[i].place.loc != null ){
		var eventIcon = icon;
		if (locations[i].sentiment > 0.5)
			eventIcon = posIcon;
		else if (locations[i].sentiment > 0)
			eventIcon = negIcon;

		marker = new google.maps.Marker({
			position: new google.maps.LatLng(locations[i].place.loc.coordinates[1], locations[i].place.loc.coordinates[0]),
			map: map,
			icon: eventIcon
		})
	};


	google.maps.event.addListener(marker, 'click', (function(marker, i) {
		var numComments = locations[i].numComments + " Comment";
		if (locations[i].numComments != 1)
			numComments += "s";

		return function() {
			infowindow.setContent("<center>"+'<font face="Raleway">'+"<h3><a href="+"eventview.html?eventid="+locations[i]._id+">" +locations[i].name+"</a></h3><div class='numComments'>" + numComments + "</div><br /><h4>Location: "+locations[i].place.name +"</h4><br>"+locations[i].description+"</font></center>");
			infowindow.open(map, marker);
		}
	})(marker, i));
}//*/
