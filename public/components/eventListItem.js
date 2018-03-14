import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import '../styles/eventListItem.css';

function formatDate(dateStr) {
	if (!dateStr) return "";
	var d = new Date(dateStr);
	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	var hour = d.getHours();
	var ap = hour >= 12 ? 'pm' : 'am';

	if (hour == 0) hour = 12;
	else if (hour > 12) hour -= 12;

	return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' - ' + hour + ':' + String(d.getMinutes()).padStart(2, '0') + ' ' + ap;
}

export default class EventListItem extends React.Component {
	render() {
		var event = this.props.event;

		var url = 'eventview.html?eventid='+event._id;
		return (
			<div key={event.url} className="event-box">
				<div className="event-header"><a href={url}>{event.name}</a></div>
				<div className="event-body">
					<tr>
						<td><span className="table-header">Location</span></td>
						<td>{event.place.name}</td>
					</tr>
					<tr>
						<td><span className="table-header">Date</span></td>
						<td>{formatDate(event.event_times[0].start_time)}</td>
					</tr>
					<tr>
						<td><span className="table-header">Time</span></td>
						<td>{formatDate(event.event_times[0].start_time)}</td>
					</tr>
				</div>
			</div>
		);
	}
}
