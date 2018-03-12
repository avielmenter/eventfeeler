import React, { Component } from 'react';

import '../styles/nav.css'

export default class NavBar extends Component {
	render() {
		return (
			<ul>
				<li><a href="map.html"><img src="/images/calendar.png" /><br /> EVENTFEELER</a></li>
				<li><a href="index.html"><i className="fas fa-home"> </i></a></li>
				<li><a href="map.html"><i className="fas fa-map-marker-alt"></i></a></li>
				<li><a href="search.html"><i className="fas fa-search"></i></a></li>
				<li><a href="recommendation.html"><i className="fas fa-thumbs-up"></i></a></li>
			</ul>
		)
	}
}