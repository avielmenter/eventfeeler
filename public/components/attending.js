import React from 'react';
import axios from 'axios';

import '../styles/attending.css';

import Switch from 'react-toggle-switch';

export default class Attending extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			attending: false,
			current_user: null
		};
		
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillMount() {
		this.serverRequest = axios.get('/api/user/current')
			.then(u => {
				this.setState({
					attending: u.data.attending && u.data.attending.includes(this.props.event_id),
					current_user: u.data
				});
			});
	}

	handleSubmit(event) {
		var url = 'eventview.html?eventid=' + this.props.event_id;

		if (!this.state.current_user){ 
			alert('You must be logged in to indicate attendance.');
			return;
		}

		axios.post('/api/attending/' + this.props.event_id, this.state.attending ? "cancel=true" : "")
			.then(r => {
				this.setState({
					attending: !this.state.attending
				})
			});

		event.preventDefault();
	}

	render() {
		return (
			<div className="attending">
				<strong>{this.state.attending ? "Attending" : "Not Attending"}</strong><br />
				<Switch onClick={this.handleSubmit} on={!this.state.attending ? false : true} />
			</div>
		);
	}
}