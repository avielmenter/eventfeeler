class eventAPI {
    constructor(setAPI, setID) {
        this.api = setAPI;
        this.event_id = setID;
    }

    async get() {
        if (!this.event_id)
            throw new Error("You must specify an event ID.");

        this.api.connect();

        var e = await this.api.schemas.Events.model.findById(this.event_id);
        if (!e)
            throw new Error("No event found with the specified ID.");

        return e;
    }
}

module.exports = (setAPI, setID) => new eventAPI(setAPI, setID);
