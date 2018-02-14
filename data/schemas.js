var mongoose = require('mongoose');

var schemas = {};

schemas.Events = require('./schemas/events.js')
schemas.EventsTimespans = require('./schemas/events_timespans.js')

module.exports = schemas;
