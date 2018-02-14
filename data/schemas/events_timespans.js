var mongoose = require('mongoose');

class EventsTimespans
{
    constructor()
    {
        this.schema = new mongoose.Schema({
            start: Date,
            end: Date
        });
    }
}

module.exports = new EventsTimespans();
