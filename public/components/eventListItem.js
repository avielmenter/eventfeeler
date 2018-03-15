import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';

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
		let event = this.props.event;
		let url = 'eventview.html?eventid='+event._id;

		var event_times = event.event_times ? event.event_times : [];
		event_times.sort((a, b) => moment(a.start_time).diff(moment(b.start_time), 'minutes'));

		var event_time = event_times[0];

		for (let et of event.event_times) {	// event we show should be next upcoming event time
			event_time = et;

			if (moment(et.start_time).diff(moment(new Date()), 'minutes') > 0)
				break;
		}

		return (
			<div key={event.url} className="event-box">
				<div className="event-header"><a href={url}>{event.name}</a></div>
				<div className="event-body">
					<tr>
						<td><span className="table-header">Location</span></td>
						<td>{event.place.name}</td>
					</tr>
					<tr>
						<td><span className="table-header">Starts</span></td>
						<td>{formatDate(event_time.start_time)}</td>
					</tr>
					{event_time.end_time && 
					<tr>
						<td><span className="table-header">Ends</span></td>
						<td>{formatDate(event_time.end_time)}</td>
					</tr>}
				</div>
			</div>
		);
	}
}
