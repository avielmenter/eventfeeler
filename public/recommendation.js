import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';

import NavBar from './components/navbar';

export default class App extends React.Component {

	constructor(props, context) {
		super(props, context);

		this.state = {
			events: []
		}
	}

	componentDidMount() {
		var last_week = new Date();
		last_week.setDate(last_week.getDate() - 7);
		var th = this;
		this.serverRequest =
			axios.get('/api/search/recommendation?days_out=&limit=')
				.then(function(result) {
					th.setState({
						events: result.data
					});
				})
	}

	componentWillUnmount() {
		this.serverRequest.abort();
	}

	render() {
		return (
			<div>
				<center><h1>Recommended for you</h1></center>
				{this.state.events.map(function(event) {
					var url = 'eventview.html?eventid='+event._id;
					console.log(event.event_times.start_time)
					return (
						<div key={event.url} className="event">
							<a href={url}>
								{event.name} |
								{event.place.name} | Time: {event.event_times[0].start_time} | Date: {event.event_times[0].start_time}
							</a>
						</div>
					);
				})}
			</div>
		)
	}
}

var last_week = new Date();
last_week.setDate(last_week.getDate() - 7);
var url = '/api/search/events?since=' + last_week + '&until=' + (new Date());

ReactDOM.render(<NavBar />, document.getElementsByTagName("nav")[0]);
ReactDOM.render(<App/>, document.querySelector("#root"));