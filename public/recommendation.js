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
			axios.get('/api/search/recommendation?days_out=7&limit=9')
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
		const recommendedList = this.state.events.map(e => <EventListItem event={e} />);
		const recommendationsText = (
			<div>
				You've got no recommendations so far.<br /><br />
				Eventfeeler can recommend events near UCI by seeing what events you're attending.  So don't be shy to say you're going places!
			</div>
		);
		return (
			<div>
					<h1>Recommended for you</h1>
				<div className="recommender-events-list">
					{recommendedList.length ? recommendedList : recommendationsText}
				</div>
			</div>
		)
	}
}

ReactDOM.render(<NavBar />, document.getElementsByTagName("nav")[0]);
ReactDOM.render(<App/>, document.querySelector("#root"));
