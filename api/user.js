class userAPI {
    constructor(setAPI, setID) {
        this.api = setAPI;
        this.user_id = setID;
    }

    async get() {
        if (!this.user_id)
            throw new Error("You must specify a user ID.");

        this.api.connect();

        var u = await this.api.schemas.Users.model.findById(this.user_id);
        if (!u)
            throw new Error("No user found with the specified ID.");

        return u;
    }

    async attend(event_id, attending) {
        if (!this.user_id || !event_id)
            throw new Error("You must specify a user ID and event ID to say that a user is attending an event. ");

        var e = await this.api.schemas.Events.model.findById(event_id);
        if (!e)
            throw new Error("You must specify a valid event ID for a user to attend.");

        var u = await this.get();

        if (attending && !u.attending.includes(event_id)) {
            u.attending.push(event_id);
            await u.save();
        }
        else if (!attending && u.attending.includes(event_id)) {
            u.attending.splice(u.attending.indexOf(event_id), 1);
            await u.save();
        }

        return u;
    }
}

module.exports = (setAPI, setID) => new userAPI(setAPI, setID);
