class attendingAPI {
    constructor(setAPI, setID) {
        this.api = setAPI;
        this.event_id = setID;
    }

    async get() {
        if (!this.event_id)
            throw new Error("You must specify an event ID to see which users are attending the event.");

        this.api.connect();

        var attendees = await this.api.schemas.Users.model.find({ attending: this.event_id });
        return attendees;
    }

    async post(req) {
        if (!req.user || !req.user._id || !this.event_id)
            throw new Error("You must specify a user ID and event ID to say that a user is attending an event. ");

        var user_id = req.user._id;

        this.api.connect();

        var e = await this.api.schemas.Events.model.findById(this.event_id);
        if (!e)
            throw new Error("You must specify a valid event ID for a user to attend.");

        var u = await this.api.schemas.Users.model.findById(user_id);
        if (!u)
            throw new Error("You be logged in to indicate attendance.");

        var attending = !(req.body.cancel);

        if (attending && !u.attending.includes(this.event_id)) {
            u.attending.push(this.event_id);
            await u.save();
        }
        else if (!attending && u.attending.includes(this.event_id)) {
            u.attending.splice(u.attending.indexOf(this.event_id), 1);
            await u.save();
        }

        return u;
    }
}

module.exports = (setAPI, setID) => new attendingAPI(setAPI, setID);
