import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import axios from 'axios';
import moment from 'moment';
import './qs';

import NavBar from './components/navbar';
import Comments from './components/comments';

class EventData extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			users:[],
			count: 0
		};
	}

	componentDidMount() {
		var queries = qs.get();
		console.log(queries.eventid);
		axios.get('/api/event/'+queries.eventid)
			.then(response => {
				this.setState({ users: response.data }, function () {
					console.log(this.state.users);
				});
			});
	}

	render() {
		var queries = qs.get();

		var userId = '';
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				userId = JSON.parse(this.responseText);
			}
		};
		xhttp.open("GET", '/api/user/current', false);
		xhttp.send();

		var userAttending = "Not Going";
		var userinfo = '';
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				userinfo =	JSON.parse(this.responseText);
			}
		};
		xhttp.open("GET", '/api/attending/'+queries.eventid, false);
		xhttp.send();
		for(var i = 0; i < userinfo.length; i++){
			if(userinfo[i]._id == userId._id){
				userAttending = "Going";
			}
		}
		var numUsers = 0;
		numUsers = userinfo.length;
		return (
			<center>
				<div id ="detail"> 
					<div id="hi">{this.state.users.name}</div> < br />
				<div className="btn-group"></div>
				<font size="4">
					<strong>Event Description:</strong>
				</font><br /> 
				{this.state.users.description} < br /><br />
				<font size="4">
					<strong>Location:</strong>
				</font><br /> 
				{this.state.users.place && this.state.users.place.name} <br /><br />
				<font size="4">
					<strong>Categories:</strong>
				</font><br /> 
				{this.state.users && this.state.users.categories}<br /><br />
				<font size="4">
					<strong>Time &amp; Date:</strong>
				</font><br /> 
				{this.state.users && this.state.users.event_times&& this.state.users.event_times[0].start_time} figure out how to change to utc<br /><br/>	<b> Average Sentiment Score: </b>{this.state.users.sentiment}< br/>
				<b>Number of users attending: </b>{numUsers}<br/><br/>
				<b>Status:</b> {userAttending}<Not /><br/> 
				<div id="hi2"> Comments</div>
					<CommentForm /> 
					<Comments event_id={queries.eventid} />
				</div>
			</center>
		);
	}
}

class Not extends React.Component {
	constructor(props) {
		super(props);
		this.state = {value: 'Comment on this event here'};
		this.id = qs.get().eventid;
		console.log(this.id);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSubmit2 = this.handleSubmit2.bind(this);
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event) {
		console.log('this.id: '+this.id);
		console.log('this.state.value: '+this.state.value);
		var http = new XMLHttpRequest();
		var url = 'api/attending/'+String(this.id);
		var params = "cancel=";
		http.open("POST", url, true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
					console.log(http.responseText);
			}
		}
		http.send(params);

		event.preventDefault();
		url = 'eventview.html?eventid='+this.id;
		location.href = url;
	}

	handleSubmit2(event) {
		console.log('this.id: '+this.id);
		console.log('this.state.value: '+this.state.value);
		var http = new XMLHttpRequest();
		var url = 'api/attending/'+String(this.id);
		var params = "cancel=true";
		http.open("POST", url, true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
					console.log(http.responseText);
			}
		}
		http.send(params);

		event.preventDefault();
		url = 'eventview.html?eventid='+this.id;
		location.href = url;
	}

	render() {
		return (
			<center>	
				<div className="btn-group">
					<form onSubmit={this.handleSubmit}>
						<button type="submit" id="going" className="btn btn-size">Going</button>
					</form>
					<form onSubmit={this.handleSubmit2}>
						<button type="submit" id="notGoing" className="btn btn-size">Not Going</button>
					</form>
				</div>
			</center>
		);
	}
}

class CommentForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {value: 'Comment on this event here'};
		this.id = qs.get().eventid;
		console.log(this.id);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	handleSubmit(event) {
		console.log('this.id: '+this.id);
		console.log('this.state.value: '+this.state.value);
		//		 fetch('api/comment/', {
		//	 method: 'POST',
		//	 headers: {
		//		 Accept: 'application/json',
		//		 'Content-Type': 'application/json',
		//	 },
		//	 body: ({
		//		 text: this.state.value,
		//		 event_id: this.id,
		//	 }),
		// });
		var http = new XMLHttpRequest();
		var url = 'api/comment/';
		var params = "text="+ String(this.state.value)+"&event_id="+String(this.id);
		http.open("POST", url, true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
					console.log(http.responseText);
			}
		}
		http.send(params);

		event.preventDefault();
		url = 'eventview.html?eventid='+this.id;
		location.href = url;
	}

	render() {
		return (
			<center>		
				<div className="comment"><br />
				</div>
				<form onSubmit={this.handleSubmit}>
					<label htmlFor='comment'>
						<textarea className="form-control" rows="5" cols ="60" id="comment" type="text" value={this.state.value} onChange={this.handleChange}></textarea>
					</label><br />
				<button type="submit" className="btn btn-size">Submit</button>
				</form> 
			</center>
		);
	}
}

ReactDOM.render(<NavBar />, document.getElementsByTagName('nav')[0]);
ReactDOM.render(<div><EventData /></div>, document.getElementById("root"));