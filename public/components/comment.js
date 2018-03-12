import React, { Component } from 'react';
import axios from 'axios';

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
		var info = this.state.user;
		var link = String(info.twitter.image_url ? info.twitter.image_url : "");

		return (
			<div className="event">
				<img src ={link}></img>
				<b> {info.twitter.display_name}</b> @{info.twitter.username} {comment.comment_time} <br/><br/>
				<div id ="comment2">{comment.text}</div><br/> <b> Comment Sentiment:</b> {comment.sentiment}
			</div>
		);
	
	}
}