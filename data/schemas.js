var mongoose = require('mongoose');

var schemas = {};

schemas.Events = mongoose.model('events', {
    name : String,
    categories : [String],
    lat : Number,
    long : Number
});

module.exports = schemas;
