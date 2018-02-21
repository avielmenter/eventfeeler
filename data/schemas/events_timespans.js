var mongoose = require('mongoose');

class EventsTimespans
{
    constructor()
    {
        this.schema = new mongoose.Schema({
            start: Date,
            end: Date
        });

        this.model = mongoose.model('events_timespans', this.schema);
    }
}

module.exports = new EventsTimespans();
