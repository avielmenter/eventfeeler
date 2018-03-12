import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';

import NavBar from './components/navbar';
import EventListItem from './components/eventListItem';

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
				{this.state.events.map(e => <EventListItem event={e} />)}
			</div>
		)
	}
}

var last_week = new Date();
last_week.setDate(last_week.getDate() - 7);
var url = '/api/search/events?since=' + last_week + '&until=' + (new Date());

ReactDOM.render(<NavBar />, document.getElementsByTagName("nav")[0]);
ReactDOM.render(<App/>, document.querySelector("#root"));