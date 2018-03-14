import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';
import moment from 'moment';
import './qs';

import NavBar from './components/navbar';
import Comments from './components/comments';
import Sentiment from './components/sentiment';
import Attending from './components/attending';
import CommentForm from './components/commentForm';

class EventData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			event: {}
		};
	}

	componentDidMount() {
		var queries = qs.get();
		console.log(queries.eventid);
		axios.get('/api/event/'+queries.eventid)
			.then(response => {
				this.setState({ event: response.data });
			});
	}

	render() {
		var queries = qs.get();
		var categories = "";
		if (this.state.event && this.state.event.categories) {
			for (let c of this.state.event.categories) {
				if (categories != "")
					categories += ", ";
				categories += c;
			}
		}

		return (
			<div className="event_info">
				<div id ="detail">
					<div className="event-left">
						<div id="hi">
							<Sentiment neutral="0" pos={this.state.event.sentiment} />&nbsp;
							{this.state.event.name}
						</div>
						<br />
						<div className="btn-group"></div>
						<strong>Time &amp; Date:</strong><br />
						{this.state.event && this.state.event.event_times &&
							moment(this.state.event.event_times[0].start_time).format('LLLL')}<br />
						<br />
						<strong>Event Description:</strong>
						<br />
						{this.state.event.description} < br /><br />
						<strong>Location:</strong>
						<br />
						{this.state.event.place && this.state.event.place.name} <br /><br />
						<strong>Categories:</strong>
						<br />
						{categories}<br /><br />
						<Attending event_id={queries.eventid} />
						<br/>
					</div>
					<div className="event-right">
						<div id="hi2"> Comments</div>
						<CommentForm event_id={queries.eventid} />
						<Comments event_id={queries.eventid} />
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<NavBar />, document.getElementsByTagName('nav')[0]);
ReactDOM.render(<div><EventData /></div>, document.getElementById("root"));
