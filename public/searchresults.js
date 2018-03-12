import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';

import NavBar from './components/navbar';
import EventListItem from './components/eventListItem';

import './qs';

export default class App extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			events: []
		}
	}

	componentDidMount() {
		var queries = qs.get();
		console.log(queries);
		console.log(Object.keys(queries).length);
		//Object.keys(queries)[0]+ "=" +queries[Object.keys(queries)[0]];
		var url = "/api/search/events?"
		var url2 = "";
		for (var key in queries) {
			if (queries.hasOwnProperty(key)) {
				var val = queries[key];
				url2 += "&"+key+"="+val;
			}
		}
		var url3;
		url3 = url2.slice(1);
		console.log(url3);
		url+= url3;
		//'/api/search/events?since=' + last_week + '&until=' + (new Date())
		console.log(url);
		var last_week = new Date();
		last_week.setDate(last_week.getDate() - 7);
		var th = this;
		this.serverRequest =
			axios.get(url)
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
				<h1>Results found based on your search</h1>
				{this.state.events.map(e => <EventListItem key={e._id} event={e} />)}
			</div>
		)
	}
}

ReactDOM.render(<NavBar />, document.getElementsByTagName("nav")[0]);
ReactDOM.render(<App/>, document.querySelector("#root"));