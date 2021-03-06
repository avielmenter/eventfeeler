import React from 'react';
import axios from 'axios';

import Comment from './comment';

import '../styles/comment.css';

export default class Comments extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			comments: []
		};
	}

	componentDidMount() {
		this.serverRequest = axios.get('/api/search/comments?event_id=' + this.props.event_id)
			.then(result => {
				this.setState({
					comments: result.data
				});
			})
	}

	componentWillUnmount() {
		//this.serverRequest.abort();
	}

	render() {
		return (
			<div>
				{this.state.comments.map(c => <div><Comment key={c._id} comment={c} /><br/></div> )}
			</div>
		)
	}
}
