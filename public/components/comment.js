import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';

import Sentiment from './sentiment';

export default class Comment extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			user: { twitter: { image_url: "", display_name: "", userame: "" }}
		}
	}

	componentDidMount() {
		this.serverRequest = axios.get('/api/user/' + this.props.comment.user_id)
			.then(u => {
				console.log("USER INFO: " + JSON.stringify(u.data));
				this.setState({ user: u.data });
			}).catch(err => {
				console.log("ERROR FETCHING COMMENT USER DATA: " + err); 
			});
	}

	componentWillUnmount() {
		//this.serverRequest.abort();
	}

	render() {
		var comment = this.props.comment;
		var info = this.state.user.twitter ? this.state.user.twitter : this.state.user.facebook;

		var link = String(info.image_url ? info.image_url : "");

		return (
			<div className="event">
				<Sentiment neutral={comment.neutral} pos={comment.sentiment} />&nbsp;
				<img src ={link}></img>
				<b> {info.display_name}</b> {info.username ? '@' + info.username : ''}<br /> 
				{comment.comment_time && moment(comment.comment_time).format('LLLL')} <br/><br/>
				<div id ="comment2">{comment.text}</div>
			</div>
		);
	
	}
}